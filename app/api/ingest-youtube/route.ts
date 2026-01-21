import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { AI_CONFIG } from "@/config/ai-config";

const genAI = new GoogleGenerativeAI(AI_CONFIG.apiKey);

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
          transcriptText = transcript.map((t) => `[${t.offset}s] ${t.text}`).join("\n");
        } catch (e) {
          console.warn("Transcript fetch failed, switching to AI fallback:", e);
          isFallbackMode = true;
        }
    }

    // 3. Prompt Gemini (Upgraded to Gemini 3.0 Logic)
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
    
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
        (Same JSON structure as standard mode)
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
        {
          "title": "Song Title",
          "lrcData": [
            {"timestamp": "[00:12.45]", "content": "I'm a Queencard, you wanna be the Queencard?"}
          ],
          "keywords": [
            {
              "word": "Stunner",
              "definition": "Someone who looks absolutely amazing and shocks everyone.",
              "phonetic": "/ˈstʌn.ər/",
              "example": "She walked in looking like a total stunner.",
              "cefr": "B1"
            }
          ],
          "scenarioDialogue": {
            "character": "Yuqi",
            "text": "Hey Neverland! Did you see my outfit in the MV? It's totally giving rockstar vibes, right?",
            "translation": "嘿 Neverland！你有看到我在 MV 裡的造型嗎？完全是搖滾巨星的氛圍對吧？",
            "question": "What kind of vibe do you think suits me best?"
          },
          "quiz": [
            {
              "question": "What is a 'Queencard'?",
              "options": ["A playing card", "A popular girl", "A credit card", "A map"],
              "correctAnswer": "A popular girl"
            }
          ],
          "mentor": {
            "name": "Soyeon",
            "avatar": "/assets/avatars/soyeon.png"
          },
          "difficulty": 2,
          "proficiency": { "totalScore": 100, "rank": "Rookie" },
          "mediaUrl": "${url}",
          "videoId": "${videoId}"
        }
      `;
    } else {
      // Fallback flow: AI Retrieval Mode
      prompt = `
        **ROLE**: You are "Gemini 3.0", the K-pop lyrics expert.
        **SITUATION**: I cannot fetch the subtitles for this video, but it is likely a (G)I-DLE song or related content.
        
        **INPUT**:
        - URL: ${url}
        - Video ID: ${videoId}
        
        **TASK**:
        1. **Identify the Song**: Based on the Video ID and your knowledge base, identify the song.
        2. **Retrieve Lyrics**: Provide the full lyrics (English/Korean mixed as per original).
        3. **Estimate LRC**: Generate ESTIMATED timestamps. It doesn't have to be perfect, but should flow logically (Verse 1 starts ~0:15, Chorus ~0:50, etc.).
        4. **Generate Learning Content**: Create the same rich learning content (Keywords, Scenario, Quiz) as usual.
        
        **IF YOU CANNOT IDENTIFY THE SONG**:
        Return a JSON with a field "error": "manual_input_needed" and a "message": "Oh no! I couldn't find this song in my database. Please help me by pasting the lyrics!".

        **REQUIREMENTS**:
        (Same as standard mode: Keywords, Scenario, Quiz, etc.)
        
        **OUTPUT FORMAT (JSON ONLY)**:
        (Same structure as above. If failed, return {"error": "manual_input_needed", "message": "..."})
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Cleanup JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(text);

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
