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

    const { url, difficulty = "auto" } = await req.json();
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
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map((t) => `[${t.offset}s] ${t.text}`).join("\n");
    } catch (e) {
      console.error("Transcript fetch failed:", e);
      // Fallback: If transcript fails, we might still proceed if we had the title, 
      // but for now let's error out or ask Gemini to hallucinate based on metadata if we could fetch it.
      // We will try to ask Gemini to generate generic info if transcript fails, 
      // but for "lyrics" it's risky. Let's return error for now.
      return NextResponse.json({ error: "Could not fetch subtitles. Please ensure the video has CC enabled." }, { status: 400 });
    }

    // 3. Prompt Gemini (Upgraded to Gemini 3.0 Logic)
    // Using configured model (default: gemini-2.0-flash)
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.model });
    
    // Determine difficulty level prompt
    const difficultyPrompt = difficulty === "auto" 
      ? "Assess the difficulty automatically based on vocabulary complexity." 
      : `Target a difficulty level of ${difficulty} (1=Easy, 2=Medium, 3=Hard). Select keywords and quiz questions accordingly.`;

    const prompt = `
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
            "question": "What does 'Queencard' mean in this context?",
            "options": ["A playing card", "The most popular girl", "A queen's guard", "A credit card"],
            "correctAnswer": "The most popular girl"
          }
        ],
        "mentor": "Yuqi",
        "difficulty": 2,
        "proficiency": "B1"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Cleanup JSON
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(text);

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
