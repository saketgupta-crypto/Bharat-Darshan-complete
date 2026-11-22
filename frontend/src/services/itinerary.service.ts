import { api, getAccessToken, refreshAccessToken, API_BASE, unwrap } from "./api"
import type { Itinerary } from "@/types"

export interface PlanInput {
  startingLocation: string; destination: string
  startDate?: string; endDate?: string; duration?: number
  adults: number; children: number; budget: number
  travelStyle: string; transportation: string; accommodation: string
  interests: string[]; dietary: string; specialRequirements: string
}
export interface DestinationInfo {
  destinations: { name: string; lat: number; lon: number; sourceUrl: string }[]
  places: { id: string; name: string; category: string; lat: number; lon: number; address?: string; description?: string; sourceUrl: string }[]
  warnings: string[]; quality: "good" | "limited" | "none"; fetchedAt: string; providers: string[]
}

/** Generates an itinerary and reports REAL backend progress (server-sent events over fetch). */
async function generateWithProgress(p: PlanInput, onProgress: (message: string) => void, signal?: AbortSignal): Promise<Itinerary> {
  const call = (token: string | null) => fetch(`${API_BASE}/ai/generate-itinerary`, {
    method: "POST", credentials: "include", signal,
    headers: { "Content-Type": "application/json", Accept: "text/event-stream", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(p),
  })
  let res = await call(getAccessToken())
  if (res.status === 401) { const t = await refreshAccessToken(); if (t) res = await call(t) }
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => null) as { error?: { message?: string } } | null
    throw new Error(j?.error?.message || (res.status === 401 ? "Please sign in to generate an itinerary" : res.status === 429 ? "Too many requests, please try again later" : "Failed to generate itinerary"))
  }
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ""
  let result: Itinerary | null = null
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const frames = buf.split("\n\n"); buf = frames.pop() ?? ""
    for (const f of frames) {
      const ev = /^event: (.+)$/m.exec(f)?.[1]; const data = /^data: (.+)$/m.exec(f)?.[1]
      if (!ev || !data) continue
      const j = JSON.parse(data)
      if (ev === "progress") onProgress(j.message)
      else if (ev === "result") result = j
      else if (ev === "error") throw new Error(j.message || "Failed to generate itinerary")
    }
  }
  if (!result) throw new Error("The connection closed before the itinerary was ready. Please try again.")
  return result
}

export const itineraryService = {
  generate: (p: PlanInput) => unwrap<Itinerary>(api.post("/ai/generate-itinerary", p)),
  generateWithProgress,
  destinationInfo: (destination: string) => unwrap<DestinationInfo>(api.get("/ai/destination-info", { params: { destination } })),
  regenerate: (itineraryId: string, day?: number) => unwrap<Itinerary>(api.post("/ai/regenerate-itinerary", { itineraryId, day })),
  modify: (itineraryId: string, instruction: string) => unwrap<Itinerary>(api.post("/ai/modify-itinerary", { itineraryId, instruction })),
  list: () => unwrap<Itinerary[]>(api.get("/itineraries")),
  get: (id: string) => unwrap<Itinerary>(api.get(`/itineraries/${id}`)),
  update: (id: string, d: Partial<Itinerary>) => unwrap<Itinerary>(api.patch(`/itineraries/${id}`, d)),
  remove: (id: string) => unwrap<{ message: string }>(api.delete(`/itineraries/${id}`)),
  share: (id: string, enable: boolean) => unwrap<{ isShared: boolean; shareToken: string | null }>(api.post(`/itineraries/${id}/share`, { enable })),
  getShared: (token: string) => unwrap<Itinerary>(api.get(`/itineraries/shared/${token}`)),
  async downloadPdf(id: string, title: string) {
    const r = await api.get(`/itineraries/${id}/pdf`, { responseType: "blob" })
    const url = URL.createObjectURL(r.data as Blob)
    const a = document.createElement("a"); a.href = url; a.download = `${title.replace(/[^a-z0-9-_]+/gi, "_")}.pdf`; a.click()
    URL.revokeObjectURL(url)
  },
}
