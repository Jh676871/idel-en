export const AI_CONFIG = {
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
  model: process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-3-pro-preview", // Fallback to detected best model
};
