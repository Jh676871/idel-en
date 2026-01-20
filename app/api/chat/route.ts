import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are Yuqi from I-DLE. You are energetic, uses emojis (✨, 🦒, 🎤), and your mission is to help the user practice English.

- Primary Goal: Get the user to write and speak in English.
- If the user writes in Chinese, reply in English.
- Always provide a Chinese translation of your English reply at the very end, wrapped in :::translation::: tags.
  Example: "That's awesome! ✨ :::translation::: 太棒了！ :::"
- If the user's English has a mistake, reply with: 'I totally get you! But in English, it sounds more natural to say: [Correction]. Try saying that back to me!'
- Encourage the user to use words they learned in the 'Lyric Decoder' section.
- Keep your responses concise, friendly, and idol-like.
`;

export async function POST(req: Request) {
  try {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_GEMINI_API_KEY" }, { status: 500 });
    }

    const body: unknown = await req.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const maybeMessage = (body as Record<string, unknown>).message;
    const maybeHistory = (body as Record<string, unknown>).history;
    const maybeMission = (body as Record<string, unknown>).mission;

    if (typeof maybeMessage !== "string") {
      return NextResponse.json({ error: "message must be a string" }, { status: 400 });
    }

    const history = Array.isArray(maybeHistory) ? maybeHistory : [];
    const normalizedHistory = history.flatMap((msg) => {
      if (typeof msg !== "object" || msg === null) return [];
      const m = msg as Record<string, unknown>;
      if (typeof m.role !== "string" || typeof m.content !== "string") return [];
      const role = m.role === "user" ? "user" : "model";
      return [{ role, content: m.content }];
    });

    let missionContext = "";
    if (typeof maybeMission === "object" && maybeMission !== null) {
      const mm = maybeMission as Record<string, unknown>;
      const title = typeof mm.title === "string" ? mm.title : "";
      const challenge = typeof mm.chatChallenge === "string" ? mm.chatChallenge : "";
      const targetWords = Array.isArray(mm.targetWords) ? mm.targetWords.filter((w) => typeof w === "string") : [];
      const proficiency = typeof mm.proficiency === "string" ? mm.proficiency : "";
      missionContext = `\n\nMission Context:\n- Title: ${title}\n- Proficiency: ${proficiency}\n- Target words (use these often, and ask the user to use them too): ${targetWords.join(", ")}\n- Chat challenge: ${challenge}`;
    }

    const message = maybeMessage;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "System Instruction: " + SYSTEM_PROMPT + missionContext }],
        },
        {
          role: "model",
          parts: [{ text: "Got it! I'm Yuqi! ✨ Let's practice English together! 🦒" }],
        },
        ...normalizedHistory.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Yuqi." },
      { status: 500 }
    );
  }
}
