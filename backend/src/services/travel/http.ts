import { env } from "../../config/env";

/** fetch with timeout + identifying User-Agent (required by the OSM/Nominatim/Overpass usage policies). */
export async function getJson<T>(url: string, opts: { timeoutMs?: number; method?: "GET" | "POST"; body?: string; headers?: Record<string, string> } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 12_000);
  try {
    const r = await fetch(url, {
      method: opts.method ?? "GET", body: opts.body, signal: ctrl.signal,
      headers: { "User-Agent": env.TRAVEL_DATA_USER_AGENT, Accept: "application/json", ...opts.headers },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
