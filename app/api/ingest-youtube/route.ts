import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_GEMINI_API_KEY" }, { status: 500 });
    }

    const { url } = await req.json();
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

    // 3. Prompt Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an expert English teacher for a 12-year-old K-pop fan.
      Analyze the following YouTube transcript for a song/video:
      
      ${transcriptText.substring(0, 20000)} // Limit length just in case

      Task:
      1. Identify the likely Song Title (and Artist).
      2. Convert the transcript into a clean LRC-like format. The transcript has [seconds], convert to [mm:ss.xx]. Consolidate fragmented lines into meaningful lyric lines.
      3. Extract 5 high-impact English keywords suitable for a 12-year-old (CEFR A2-B1). 
      4. Create 3 post-song quiz questions (multiple choice) to test comprehension or vocabulary.
      5. Assign a "Member Mentor" (Soyeon, Miyeon, Minnie, Yuqi, Shuhua) who fits the vibe.
      6. Estimate difficulty (1=Easy, 2=Medium, 3=Hard).
      7. Provide a CEFR level (A2, B1, B2, C1).

      Return ONLY valid JSON with this structure:
      {
        "title": "Song Title",
        "lrcData": [{"timestamp": "[00:12.00]", "content": "Lyric line"}],
        "keywords": [
          {
            "word": "word",
            "definition": "simple definition",
            "phonetic": "/ipa/",
            "example": "example sentence",
            "cefr": "A2"
          }
        ],
        "quiz": [
          {
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "The correct option text"
          }
        ],
        "mentor": "Soyeon",
        "difficulty": 1,
        "proficiency": "A2"
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
