// import { GoogleGenAI } from "@google/genai";
// import { env } from "../config/env";
// import { AppError } from "../utils/AppError";

// let client: GoogleGenAI | null = null;
// const getClient = () => (client ??= new GoogleGenAI({ apiKey: env.GEMINI_API_KEY }));

import { env } from "../config/env";
import { AppError } from "../utils/AppError";

type GenAIModule = typeof import("@google/genai", { with: { "resolution-mode": "import" } });
let client: InstanceType<GenAIModule["GoogleGenAI"]> | null = null;
/** @google/genai is ESM-only; this backend is CommonJS, so it is loaded with a dynamic import(). */
async function getClient() {
  if (!client) {
    const { GoogleGenAI } = await import("@google/genai");
    client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return client;
}

export const geminiConfigured = () => !!env.GEMINI_API_KEY && !!env.GEMINI_MODEL;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, process.env.NODE_ENV === "test" ? 0 : ms));
const statusOf = (e: unknown): number | undefined => {
  const x = e as { status?: number; code?: number };
  return typeof x?.status === "number" ? x.status : typeof x?.code === "number" ? x.code : undefined;
};

/** Maps SDK/network failures to clean client-facing errors (never leaks the key or raw upstream bodies). */
export function toAiError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  const st = statusOf(e);
  if ((e as Error)?.name === "AbortError" || /timed? ?out|deadline/i.test((e as Error)?.message ?? "")) return new AppError(504, "The AI service took too long to respond. Please try again.", "AI_TIMEOUT");
  if (st === 429) return new AppError(429, "The AI service quota or rate limit was reached. Please wait a minute and try again.", "AI_QUOTA");
  if (st === 400 || st === 401 || st === 403) return new AppError(503, "The AI planner is not correctly configured on the server (check the Gemini API key/model).", "AI_NOT_CONFIGURED");
  if (st === 404) return new AppError(503, "The configured Gemini model is not available. Update GEMINI_MODEL on the server.", "AI_NOT_CONFIGURED");
  return new AppError(502, "The AI service failed. Please try again.", "AI_UPSTREAM");
}

export interface JsonCall { system: string; prompt: string; schema: Record<string, unknown>; temperature?: number }

/** One structured-JSON generation call with timeout + controlled retries on transient errors. Returns raw text. */
export async function generateJsonText(c: JsonCall): Promise<string> {
  if (!geminiConfigured()) throw new AppError(503, "AI planner is not configured on the server", "AI_NOT_CONFIGURED");
  let useSchema = true;
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const started = Date.now();
    try {
      // const res = await getClient().models.generateContent({
      const res = await (await getClient()).models.generateContent({
        model: env.GEMINI_MODEL,
        contents: useSchema ? c.prompt : `${c.prompt}\n\nReturn ONLY a JSON object matching this JSON Schema:\n${JSON.stringify(c.schema)}`,
        config: {
          systemInstruction: c.system, temperature: c.temperature ?? 0.5, maxOutputTokens: env.GEMINI_MAX_OUTPUT_TOKENS,
          responseMimeType: "application/json", ...(useSchema ? { responseSchema: c.schema as never } : {}),
          httpOptions: { timeout: env.GEMINI_TIMEOUT_MS },
        },
      });
      const text = res.text;
      if (!text) throw new AppError(502, "The AI returned an empty response.", "AI_EMPTY");
      console.info(`[gemini] ok model=${env.GEMINI_MODEL} ms=${Date.now() - started} chars=${text.length}`);
      return text;
    } catch (e) {
      lastErr = e;
      const st = statusOf(e);
      console.warn(`[gemini] fail model=${env.GEMINI_MODEL} status=${st ?? "n/a"} attempt=${attempt + 1} msg=${String((e as Error)?.message ?? e).replace(env.GEMINI_API_KEY, "***").slice(0, 160)}`);
      if (st === 400 && useSchema && attempt === 0) { useSchema = false; continue; } // model/schema combo rejected -> prompt-only schema
      if (st === 429 || (st !== undefined && st >= 500) || (e as Error)?.name === "AbortError") {
        if (st === 429 && attempt >= 1) break;               // do not hammer a rate-limited free tier
        await sleep(1500 * (attempt + 1)); continue;
      }
      break;
    }
  }
  throw toAiError(lastErr);
}

export interface GroundedNotes { notes: string[]; sources: { title: string; url: string }[] }

/** Optional: web-grounded recent-info call (Google Search grounding). Always best-effort; failures return null. */
export async function groundedTravelNotes(destination: string): Promise<GroundedNotes | null> {
  if (!env.GEMINI_GROUNDING || !geminiConfigured()) return null;
  try {
    // const res = await getClient().models.generateContent({
    const res = await (await getClient()).models.generateContent({
      model: env.GEMINI_MODEL,
      contents: `List up to 5 short, recent, practical notes for tourists visiting ${destination}, India (closures, festivals, advisories, seasonal issues). One note per line, no markdown. If you find nothing reliable, reply NONE.`,
      config: { tools: [{ googleSearch: {} }], maxOutputTokens: 600, httpOptions: { timeout: env.GEMINI_TIMEOUT_MS } },
    });
    const notes = (res.text ?? "").split("\n").map((l) => l.replace(/^[-*\d.\s]+/, "").trim()).filter((l) => l && l !== "NONE").slice(0, 5);
    const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = chunks.flatMap((c) => (c.web?.uri ? [{ title: c.web.title ?? c.web.uri, url: c.web.uri }] : [])).slice(0, 6);
    return notes.length ? { notes, sources } : null;
  } catch (e) {
    console.warn(`[gemini] grounding unavailable status=${statusOf(e) ?? "n/a"}`);
    return null;
  }
}
