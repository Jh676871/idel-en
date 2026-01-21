import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { AI_CONFIG } from "@/config/ai-config";

const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);

// Helper for safe JSON parsing
function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const sliced = text.slice(start, end + 1);
      return JSON.parse(sliced);
    }
    throw new Error("Model did not return valid JSON");
  }
}

export async function POST(req: Request) {
  try {
    if (!AI_CONFIG.apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_GEMINI_API_KEY" }, { status: 500 });
    }

    const { url, difficulty = "auto", manualContent } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // 1. Extract Video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // 2. Fetch Transcript
    let transcriptText = "";
    let isFallbackMode = false;
    let isManualMode = !!manualContent;

    if (isManualMode) {
       transcriptText = manualContent;
    } else {
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(videoId);
          // Defensive check: Ensure transcript is an array and has content
          if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
            throw new Error("Empty transcript");
          }
          transcriptText = transcript.map((t) => `[${t.offset}s] ${t.text}`).join("\n");
        } catch (e) {
          console.warn("Transcript fetch failed, switching to AI fallback:", e);
          isFallbackMode = true;
        }
    }

    // 3. Define Schema (Strict JSON)
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        lrcData: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              timestamp: { type: SchemaType.STRING },
              content: { type: SchemaType.STRING }
            }
          }
        },
        keywords: {
          type: SchemaType.ARRAY,
          minItems: 5,
          maxItems: 10,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              word: { type: SchemaType.STRING },
              definition: { type: SchemaType.STRING },
              funny_definition: { type: SchemaType.STRING },
              phonetic: { type: SchemaType.STRING },
              example: { type: SchemaType.STRING },
              star_comment: { type: SchemaType.STRING },
              cefr: { type: SchemaType.STRING },
            },
            required: ["word", "definition", "funny_definition", "phonetic", "example", "star_comment", "cefr"],
          },
        },
        scenarioDialogue: {
            type: SchemaType.OBJECT,
            properties: {
                character: { type: SchemaType.STRING },
                text: { type: SchemaType.STRING },
                translation: { type: SchemaType.STRING },
                question: { type: SchemaType.STRING }
            },
            required: ["character", "text", "translation", "question"]
        },
        quiz: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    question: { type: SchemaType.STRING },
                    options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                    correctAnswer: { type: SchemaType.STRING }
                },
                required: ["question", "options", "correctAnswer"]
            }
        },
        mentor: {
            type: SchemaType.OBJECT,
            properties: {
                name: { type: SchemaType.STRING },
                avatar: { type: SchemaType.STRING }
            }
        },
        difficulty: { type: SchemaType.NUMBER },
        proficiency: {
            type: SchemaType.OBJECT,
            properties: {
                totalScore: { type: SchemaType.NUMBER },
                rank: { type: SchemaType.STRING }
            }
        },
        error: { type: SchemaType.STRING },
        message: { type: SchemaType.STRING }
      },
      required: ["title", "keywords", "lrcData"] // Basic requirements
    };

    // 4. Prompt Gemini (Upgraded to Gemini 3.0 Logic)
    const model = genAI.getGenerativeModel({ 
        model: AI_CONFIG.model,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.7
        }
    });

    // Repair model for JSON fixing
    const repairModel = genAI.getGenerativeModel({
      model: AI_CONFIG.model,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });
    
    // Determine difficulty level prompt
    const difficultyPrompt = difficulty === "auto" 
      ? "Assess the difficulty automatically based on vocabulary complexity." 
      : `Target a difficulty level of ${difficulty} (1=Easy, 2=Medium, 3=Hard). Select keywords and quiz questions accordingly.`;

    let prompt = "";

    if (isManualMode) {
        prompt = `
        **ROLE**: You are "Gemini 3.0", the most advanced AI content engine for K-pop education. 
        Your target audience is a **12-year-old Gen Z fan** of (G)I-DLE.
        
        **INPUT CONTEXT**:
        - Provided Lyrics (Manual Input):
        ${transcriptText.substring(0, 25000)}
  
        **TASK**:
        Analyze the input lyrics to create a "Content Hub" entry.
        
        **REQUIREMENTS**:
        1. **Song Title & Artist**: Identify based on lyrics or context if possible.
        2. **High-Precision LRC**: 
           - Since this is raw text, you MUST estimate timestamps based on song structure (Verse, Chorus) assuming a standard pop song flow, OR just output lines without timestamps if impossible (but try your best to structure it as line-by-line).
           - **Attitude Check**: If the lyrics are sassy, keep the punctuation sassy.
        3. **Keywords**: (Same as standard - 5-7 slang/power words)
        4. **Scenario Dialogue**: (Same as standard)
        5. **Member Mentor**: (Same as standard)
        6. **Quiz**: (Same as standard)
        7. **Difficulty**: ${difficultyPrompt}
  
        **OUTPUT FORMAT (JSON ONLY)**:
        Strictly follow the JSON schema provided.
        `;
    } else if (!isFallbackMode) {
      // Standard flow with transcript
      prompt = `
        **ROLE**: You are "Gemini 3.0", the most advanced AI content engine for K-pop education. 
        Your target audience is a **12-year-old Gen Z fan** of (G)I-DLE.
        
        **INPUT CONTEXT**:
        - YouTube Transcript (Lyrics/Content):
        ${transcriptText.substring(0, 25000)}
  
        **TASK**:
        Analyze the input to create a "Content Hub" entry.
        You must go beyond simple translation. You must capture the **ATTITUDE**, **STYLE**, and **VIBE** of (G)I-DLE.
        
        **REQUIREMENTS**:
        1. **Song Title & Artist**: Identify correctly.
        2. **High-Precision LRC**: 
           - Convert transcript timestamps to **[mm:ss.xx]** (centisecond precision). 
           - Ensure lines are synchronized with the natural flow of the song/speech.
           - **Attitude Check**: If the lyrics are sassy, keep the punctuation sassy.
        3. **Keywords (Slang & Culture)**:
           - Extract 5-7 keywords. 
           - **PRIORITY**: Focus on **Slang**, **Idioms**, or **Power Words** used in pop culture (e.g., "Slay", "Vibe", "Wannabe", "Queencard").
           - Avoid boring textbook words like "the" or "and".
           - Definitions must be fun and relatable for a 12-year-old.
        4. **Scenario Dialogue (Roleplay)**:
           - Create a short, immersive interaction with a member.
           - The member should ask the user a question related to the song's theme.
           - Tone: Casual, confident, "Unnie" (big sister) vibe.
        5. **Member Mentor**: Assign the most suitable member based on the song's vibe (e.g., Soyeon for fierce rap, Yuqi for deep voice/cool style).
        6. **Quiz**: 3 questions testing comprehension or vocabulary.
        7. **Difficulty**: ${difficultyPrompt}
  
        **OUTPUT FORMAT (JSON ONLY)**:
        Strictly follow the JSON schema provided.
      `;
    } else {
      // Fallback flow: AI Retrieval Mode (Enhanced)
      prompt = `
        **ROLE**: You are "Gemini 3.0", the K-pop lyrics expert with a massive 2026 knowledge base.
        **SITUATION**: I cannot fetch the subtitles for this video (${url}), but it is likely a (G)I-DLE song or related content.
        
        **TASK**:
        1. **Identify the Song**: Based on the Video ID and your knowledge base, identify the song.
        2. **Retrieve Lyrics**: Please use your 2026 knowledge base to reconstruct the full lyrics (English/Korean mixed as per original).
        3. **Estimate LRC**: Generate ESTIMATED timestamps. It doesn't have to be perfect, but should flow logically (Verse 1 starts ~0:15, Chorus ~0:50, etc.).
        4. **Generate Learning Content**: Create the same rich learning content (Keywords, Scenario, Quiz) as usual.
        
        **IF YOU CANNOT IDENTIFY THE SONG**:
        Return a JSON with a field "error": "manual_input_needed" and a "message": "Oops! AI 暫時沒聽過這首歌。身為翻譯官的妳，能手動貼上歌詞嗎？貼上後我會立刻幫妳生成關卡！".
        
        **REQUIREMENTS**:
        (Same as standard mode: Keywords, Scenario, Quiz, etc.)
        
        **OUTPUT FORMAT (JSON ONLY)**:
        Strictly follow the JSON schema provided.
      `;
    }

    let data;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Cleanup JSON
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        data = safeJsonParse(text);
    } catch (e) {
        console.warn("First attempt failed, trying repair:", e);
        // Retry logic with repair model
        const repairPrompt = `Fix the following JSON to match the schema. \n\n${prompt}`; // Simplified repair prompt
        const repairResult = await repairModel.generateContent(repairPrompt);
        const repairText = (await repairResult.response).text();
        data = safeJsonParse(repairText.replace(/```json/g, "").replace(/```/g, "").trim());
    }

    if (data.error === "manual_input_needed") {
      return NextResponse.json({ error: "manual_input_needed", message: data.message }, { status: 422 });
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...data,
        videoId, // Return ID for thumbnail
        mediaUrl: url
      } 
    });

  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
