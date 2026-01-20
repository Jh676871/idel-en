import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are an expert ESL teacher for English learners.

Rules (must follow):
- Output must be 100% English. Do NOT output Korean/Hangul or mixed-language text.
- Extract 5-10 English learning keywords appropriate for the user's CEFR level.
- For each keyword provide: definition (English), phonetic (IPA), and a member-themed example sentence (English).
- Challenges must be in English:
  1) fillInTheBlank.sentence must be an English sentence containing exactly one blank "_____".
     fillInTheBlank.answer must be a single English word and must match one of the keywords.word exactly.
  2) definitionMatching.pairs[].word must be picked from keywords.word.
  3) chatChallenge.question must be an English question that nudges using the target words.

Respond ONLY in structured JSON format.`;

type ProcessResult = {
  title: string;
  keywords: Array<{ word: string; definition: string; phonetic: string; example: string; cefr: string }>;
  challenges: {
    fillInTheBlank: { sentence: string; answer: string };
    definitionMatching: { pairs: Array<{ word: string; definition: string }> };
    chatChallenge: { question: string };
  };
};

const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

function containsHangul(value: string) {
  return HANGUL_RE.test(value);
}

function coerceProcessResult(value: unknown): ProcessResult | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.title !== "string") return null;
  if (!Array.isArray(v.keywords) || v.keywords.length < 5 || v.keywords.length > 10) return null;
  if (typeof v.challenges !== "object" || v.challenges === null) return null;
  const c = v.challenges as Record<string, unknown>;
  const fib = typeof c.fillInTheBlank === "object" && c.fillInTheBlank !== null ? (c.fillInTheBlank as Record<string, unknown>) : null;
  const dm = typeof c.definitionMatching === "object" && c.definitionMatching !== null ? (c.definitionMatching as Record<string, unknown>) : null;
  const cc = typeof c.chatChallenge === "object" && c.chatChallenge !== null ? (c.chatChallenge as Record<string, unknown>) : null;
  if (!fib || !dm || !cc) return null;
  if (typeof fib.sentence !== "string" || typeof fib.answer !== "string") return null;
  if (typeof cc.question !== "string") return null;

  const isPair = (p: unknown): p is { word: string; definition: string } => {
    if (typeof p !== "object" || p === null) return false;
    const pr = p as Record<string, unknown>;
    return typeof pr.word === "string" && typeof pr.definition === "string";
  };

  const isKeyword = (k: unknown): k is ProcessResult["keywords"][number] => {
    if (typeof k !== "object" || k === null) return false;
    const kr = k as Record<string, unknown>;
    return (
      typeof kr.word === "string" &&
      typeof kr.definition === "string" &&
      typeof kr.phonetic === "string" &&
      typeof kr.example === "string" &&
      typeof kr.cefr === "string"
    );
  };

  const pairs = dm.pairs;
  if (!Array.isArray(pairs) || pairs.length < 4 || pairs.length > 10) return null;
  if (!pairs.every(isPair)) return null;

  if (!v.keywords.every(isKeyword)) return null;

  return value as ProcessResult;
}

function validateEnglish(result: ProcessResult): { ok: true } | { ok: false; reason: string } {
  const texts: string[] = [
    result.title,
    result.challenges.fillInTheBlank.sentence,
    result.challenges.fillInTheBlank.answer,
    result.challenges.chatChallenge.question,
    ...result.keywords.flatMap((k) => [k.word, k.definition, k.phonetic, k.example, k.cefr]),
    ...result.challenges.definitionMatching.pairs.flatMap((p) => [p.word, p.definition]),
  ];

  if (texts.some((t) => containsHangul(t))) {
    return { ok: false, reason: "Contains Korean/Hangul" };
  }

  const answer = result.challenges.fillInTheBlank.answer.trim();
  if (!answer || /\s/.test(answer)) {
    return { ok: false, reason: "Fill-in answer must be a single word" };
  }

  const blanks = result.challenges.fillInTheBlank.sentence.split("_____").length - 1;
  if (blanks !== 1) {
    return { ok: false, reason: "Fill-in sentence must contain exactly one blank (_____)" };
  }

  const keywordSet = new Set(result.keywords.map((k) => k.word));
  if (!keywordSet.has(answer)) {
    return { ok: false, reason: "Fill-in answer must match a keyword" };
  }

  const pairWordSetOk = result.challenges.definitionMatching.pairs.every((p) => keywordSet.has(p.word));
  if (!pairWordSetOk) {
    return { ok: false, reason: "Definition matching words must be chosen from keywords" };
  }

  return { ok: true };
}

function cefrFromAverageMastery(avg: number) {
  if (avg >= 4) return "C1";
  if (avg >= 3) return "B2";
  if (avg >= 2) return "B1";
  return "A2";
}

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
    const adminHeader = (req.headers.get("x-admin-token") || "").trim();
    const adminToken = (process.env.ADMIN_TOKEN || "").trim();
    if (!adminToken || adminHeader !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GOOGLE_GEMINI_API_KEY" }, { status: 500 });
    }

    const body = await req.json();
    const rawText = typeof body?.rawText === "string" ? body.rawText : "";
    const type = body?.type;
    const masteryAverage = typeof body?.masteryAverage === "number" ? body.masteryAverage : 0;
    const proficiency = typeof body?.proficiency === "string" ? body.proficiency : cefrFromAverageMastery(masteryAverage);

    if (!rawText.trim()) {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }

    if (type !== "lyric" && type !== "sns" && type !== "interview") {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        keywords: {
          type: SchemaType.ARRAY,
          minItems: 5,
          maxItems: 10,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              word: { type: SchemaType.STRING },
              definition: { type: SchemaType.STRING },
              phonetic: { type: SchemaType.STRING },
              example: { type: SchemaType.STRING },
              cefr: { type: SchemaType.STRING },
            },
            required: ["word", "definition", "phonetic", "example", "cefr"],
          },
        },
        challenges: {
          type: SchemaType.OBJECT,
          properties: {
            fillInTheBlank: {
              type: SchemaType.OBJECT,
              properties: {
                sentence: { type: SchemaType.STRING },
                answer: { type: SchemaType.STRING },
              },
              required: ["sentence", "answer"],
            },
            definitionMatching: {
              type: SchemaType.OBJECT,
              properties: {
                pairs: {
                  type: SchemaType.ARRAY,
                  minItems: 4,
                  maxItems: 10,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      word: { type: SchemaType.STRING },
                      definition: { type: SchemaType.STRING },
                    },
                    required: ["word", "definition"],
                  },
                },
              },
              required: ["pairs"],
            },
            chatChallenge: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
              },
              required: ["question"],
            },
          },
          required: ["fillInTheBlank", "definitionMatching", "chatChallenge"],
        },
      },
      required: ["title", "keywords", "challenges"],
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
      },
    });

    const repairModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const prompt = `${SYSTEM_PROMPT}\n\nUser Proficiency (CEFR): ${proficiency}\nContent Type: ${type}\n\nTEXT:\n${rawText}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const json = safeJsonParse(text);
    const coerced = coerceProcessResult(json);
    if (!coerced) {
      return NextResponse.json({ error: "Model returned invalid JSON shape" }, { status: 502 });
    }

    const check = validateEnglish(coerced);
    if (check.ok) {
      return NextResponse.json({ proficiency, result: coerced });
    }

    const repairPrompt = `Rewrite the following JSON to strictly satisfy the Rules.
- Output must be 100% English (no Korean/Hangul).
- fillInTheBlank.sentence must contain exactly one blank "_____".
- fillInTheBlank.answer must be a single word and must match one of keywords.word exactly.
- definitionMatching.pairs[].word must be chosen from keywords.word.

User Proficiency (CEFR): ${proficiency}
Content Type: ${type}

JSON TO REWRITE:
${JSON.stringify(coerced)}`;

    const repaired = await repairModel.generateContent(repairPrompt);
    const repairedText = (await repaired.response).text();
    const repairedJson = safeJsonParse(repairedText);
    const repairedCoerced = coerceProcessResult(repairedJson);
    if (!repairedCoerced) {
      return NextResponse.json({ error: "Model repair returned invalid JSON shape" }, { status: 502 });
    }

    const repairedCheck = validateEnglish(repairedCoerced);
    if (!repairedCheck.ok) {
      return NextResponse.json({ error: `Model output invalid: ${repairedCheck.reason}` }, { status: 502 });
    }

    return NextResponse.json({ proficiency, result: repairedCoerced });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process content";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
