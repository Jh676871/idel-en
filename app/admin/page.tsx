"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useLearning } from "@/context/LearningContext";
import { ContentType, ProcessedMission, CefrLevel, ProcessedKeyword, ProcessedChallenges } from "@/types";

function difficultyFromCefr(cefr: CefrLevel): 1 | 2 | 3 {
  if (cefr === "C1") return 3;
  if (cefr === "B2") return 2;
  return 1;
}

function isCefrLevel(value: unknown): value is CefrLevel {
  return value === "A2" || value === "B1" || value === "B2" || value === "C1";
}

function isContentType(value: unknown): value is ContentType {
  return value === "lyric" || value === "sns" || value === "interview";
}

function isProcessedKeyword(value: unknown): value is ProcessedKeyword {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.word === "string" &&
    typeof v.definition === "string" &&
    typeof v.phonetic === "string" &&
    typeof v.example === "string" &&
    isCefrLevel(v.cefr)
  );
}

function isProcessedChallenges(value: unknown): value is ProcessedChallenges {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;

  const fib = v.fillInTheBlank as Record<string, unknown> | undefined;
  const dm = v.definitionMatching as Record<string, unknown> | undefined;
  const cc = v.chatChallenge as Record<string, unknown> | undefined;

  const pairs = dm?.pairs as unknown;
  const pairsOk =
    Array.isArray(pairs) &&
    pairs.every((p) => {
      if (typeof p !== "object" || p === null) return false;
      const pr = p as Record<string, unknown>;
      return typeof pr.word === "string" && typeof pr.definition === "string";
    });

  return (
    typeof fib?.sentence === "string" &&
    typeof fib?.answer === "string" &&
    pairsOk &&
    typeof cc?.question === "string"
  );
}

function isProcessResult(value: unknown): value is { title: string; keywords: ProcessedKeyword[]; challenges: ProcessedChallenges } {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.title === "string" &&
    Array.isArray(v.keywords) &&
    v.keywords.length >= 1 &&
    v.keywords.every(isProcessedKeyword) &&
    isProcessedChallenges(v.challenges)
  );
}

function coerceMissionJson(value: unknown): ProcessedMission | null {
  if (typeof value !== "object" || value === null) return null;
  const v = value as Record<string, unknown>;
  if (typeof v.title !== "string") return null;
  if (!isCefrLevel(v.proficiency)) return null;
  if (!Array.isArray(v.keywords) || v.keywords.length < 1 || !v.keywords.every(isProcessedKeyword)) return null;
  if (!isProcessedChallenges(v.challenges)) return null;

  const src = typeof v.source === "object" && v.source !== null ? (v.source as Record<string, unknown>) : null;
  const sourceType: ContentType = src && isContentType(src.type) ? src.type : "lyric";
  const sourceTitle = src && typeof src.title === "string" ? src.title : v.title;
  const sourceRawText = src && typeof src.rawText === "string" ? src.rawText : v.title;
  const sourceMediaUrl = src && typeof src.mediaUrl === "string" ? src.mediaUrl : undefined;

  const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString();

  return {
    id,
    createdAt: Date.now(),
    source: {
      id,
      title: sourceTitle,
      type: sourceType,
      rawText: sourceRawText,
      mediaUrl: sourceMediaUrl?.trim() ? sourceMediaUrl.trim() : undefined,
      difficulty: difficultyFromCefr(v.proficiency),
    },
    proficiency: v.proficiency,
    title: v.title,
    keywords: v.keywords,
    challenges: v.challenges,
  };
}

const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

function validateLearningEnglish(input: { keywords: ProcessedKeyword[]; challenges: ProcessedChallenges }): string | null {
  const texts: string[] = [
    ...input.keywords.flatMap((k) => [k.word, k.definition, k.phonetic, k.example, k.cefr]),
    input.challenges.fillInTheBlank.sentence,
    input.challenges.fillInTheBlank.answer,
    input.challenges.chatChallenge.question,
    ...input.challenges.definitionMatching.pairs.flatMap((p) => [p.word, p.definition]),
  ];

  if (texts.some((t) => HANGUL_RE.test(t))) {
    return "Challenges/keywords must be in English (no Hangul)";
  }

  const answer = input.challenges.fillInTheBlank.answer.trim();
  if (!answer || /\s/.test(answer)) {
    return "Fill-in answer must be a single English word";
  }

  const keywordSet = new Set(input.keywords.map((k) => k.word));
  if (!keywordSet.has(answer)) {
    return "Fill-in answer must match one of the keywords";
  }

  const pairsOk = input.challenges.definitionMatching.pairs.every((p) => keywordSet.has(p.word));
  if (!pairsOk) {
    return "Definition matching words must be chosen from keywords";
  }

  return null;
}

export default function AdminPage() {
  const { addMission, getAverageWordMastery, getSuggestedCefr } = useLearning();
  const [adminToken, setAdminToken] = useState("");
  const [type, setType] = useState<ContentType>("lyric");
  const [mediaUrl, setMediaUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState<unknown | null>(null);
  const [proficiency, setProficiency] = useState<CefrLevel>("A2");
  const [error, setError] = useState<string | null>(null);
  const [importJson, setImportJson] = useState("");
  const [importedMission, setImportedMission] = useState<ProcessedMission | null>(null);

  const avgMastery = getAverageWordMastery();
  const suggestedCefr = getSuggestedCefr();

  const handleProcess = async () => {
    setError(null);
    setProcessed(null);
    setImportedMission(null);
    setIsProcessing(true);
    try {
      const res = await fetch("/api/process-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken.trim(),
        },
        body: JSON.stringify({
          rawText,
          type,
          masteryAverage: avgMastery,
          proficiency: suggestedCefr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Failed to process");
        return;
      }

      setProficiency(data.proficiency);
      setProcessed(data.result);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to process";
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    setError(null);
    if (importedMission) {
      const importErr = validateLearningEnglish({ keywords: importedMission.keywords, challenges: importedMission.challenges });
      if (importErr) {
        setError(importErr);
        return;
      }
      addMission(importedMission);
      setImportedMission(null);
      setProcessed(null);
      setImportJson("");
      setRawText("");
      setMediaUrl("");
      return;
    }

    if (processed === null) return;
    if (!isProcessResult(processed)) {
        setError("生成的 JSON 格式不符合預期");
      return;
    }

    const genErr = validateLearningEnglish({ keywords: processed.keywords, challenges: processed.challenges });
    if (genErr) {
      setError(genErr);
      return;
    }

    const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Date.now().toString();
    const sourceRawText = rawText.trim() ? rawText : processed.title;
    const mission: ProcessedMission = {
      id,
      createdAt: Date.now(),
      source: {
        id,
        title: processed.title,
        type,
        rawText: sourceRawText,
        mediaUrl: mediaUrl.trim() ? mediaUrl.trim() : undefined,
        difficulty: difficultyFromCefr(proficiency),
      },
      proficiency,
      title: processed.title,
      keywords: processed.keywords,
      challenges: processed.challenges,
    };

    addMission(mission);
    setProcessed(null);
    setImportJson("");
    setRawText("");
    setMediaUrl("");
  };

  const handleImportJson = () => {
    setError(null);
    const text = importJson.trim();
    if (!text) return;

    try {
      const parsed: unknown = JSON.parse(text);
      if (isProcessResult(parsed)) {
        setImportedMission(null);
        setProcessed(parsed);
        if (parsed.keywords.length > 0) {
          setProficiency(parsed.keywords[0].cefr);
        }
        if (!rawText.trim()) {
          setRawText(parsed.title);
        }
        return;
      }

      if (typeof parsed === "object" && parsed !== null) {
        const v = parsed as Record<string, unknown>;
        const looksLikeMission = "proficiency" in v || "source" in v || "createdAt" in v;
        if (looksLikeMission) {
          const mission = coerceMissionJson(parsed);
          if (mission) {
            setImportedMission(mission);
            setProficiency(mission.proficiency);
            setType(mission.source.type);
            setRawText(mission.source.rawText);
            setMediaUrl(mission.source.mediaUrl || "");
            setProcessed({ title: mission.title, keywords: mission.keywords, challenges: mission.challenges });
            return;
          }
        }
      }

      setImportedMission(null);
      setProcessed(null);
      setError("JSON 格式不符合預期");
    } catch {
      setError("JSON 格式無效");
    }
  };

  return (
    <main className="min-h-screen bg-idle-purple text-white relative">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 pb-28 px-4">
        <h1 className="text-3xl font-orbitron font-bold mb-2">Admin｜AI 內容轉任務器</h1>
        <p className="text-gray-400 mb-8">建議難度：{suggestedCefr}（平均熟練度 {avgMastery.toFixed(2)}）</p>

        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">管理員 Token</label>
              <input
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
                type="password"
                placeholder="輸入 token"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">內容類型</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
              >
                <option value="lyric">歌詞</option>
                <option value="sns">社群貼文</option>
                <option value="interview">專訪</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">YouTube／IG 連結（選填）</label>
            <input
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">原始文字</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full min-h-[220px] px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
              placeholder="貼上歌詞／逐字稿／貼文內容"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">貼上已生成的 JSON（選填）</label>
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full min-h-[160px] px-4 py-3 rounded-xl bg-black/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-idle-pink"
              placeholder='貼上 {"title":...,"keywords":[...],"challenges":{...}}'
            />
            <div className="mt-3 flex justify-end">
              <button
                disabled={!importJson.trim()}
                onClick={handleImportJson}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-50"
              >
                載入 JSON
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>
          )}

          <div className="flex flex-col md:flex-row gap-3">
            <button
              disabled={!adminToken || !rawText.trim() || isProcessing}
              onClick={handleProcess}
              className="px-5 py-3 rounded-xl bg-idle-pink text-white font-bold disabled:opacity-50"
            >
              {isProcessing ? "處理中…" : "用 Gemini 生成任務"}
            </button>

            <button
              disabled={!processed}
              onClick={handleSave}
              className="px-5 py-3 rounded-xl bg-idle-gold text-black font-bold disabled:opacity-50"
            >
              加入今日演出曲目
            </button>
          </div>
        </div>

        {processed !== null && (
          <div className="mt-8 bg-black/30 rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-orbitron font-bold mb-4">生成結果（JSON）</h2>
            <pre className="text-xs whitespace-pre-wrap break-words text-gray-200">
              {JSON.stringify(processed, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
