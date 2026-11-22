import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app, auth, clearDb, loginAs, registerVerified, startDb, stopDb } from "./helpers";
import { AppError } from "../src/utils/AppError";
import type { TravelData } from "../src/services/travel/types";

const m = vi.hoisted(() => ({ gen: vi.fn(), fetchData: vi.fn() }));
vi.mock("../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => {}), sendOtpEmail: vi.fn(async () => {}), sendResetEmail: vi.fn(async () => {}), sendContactConfirmation: vi.fn(async () => {}),
}));
vi.mock("../src/services/gemini.service", async (orig) => ({
  ...(await orig<typeof import("../src/services/gemini.service")>()),
  geminiConfigured: () => true, groundedTravelNotes: async () => null, generateJsonText: (...a: unknown[]) => m.gen(...a),
}));
vi.mock("../src/services/travel/places.service", async (orig) => ({
  ...(await orig<typeof import("../src/services/travel/places.service")>()),
  fetchTravelData: (...a: unknown[]) => m.fetchData(...a),
  routeFor: async (s: unknown[]) => (s.length < 2 ? null : { distanceKm: 3.2, source: "straight-line" }),
}));
beforeAll(startDb); afterAll(stopDb); beforeEach(clearDb);

const api = "/api/v1";
const input = { startingLocation: "Lucknow", destination: "Agra", duration: 2, adults: 2, children: 0, budget: 30000, travelStyle: "Historical" };
const P = (id: string, name: string, lat: number, lon: number, cluster = 1) => ({ id, name, category: "monument", lat, lon, sourceUrl: `https://www.openstreetmap.org/node/${id.slice(1)}`, verification: "osm" as const, cluster, wikipediaUrl: id === "n1" ? "https://en.wikipedia.org/wiki/Taj_Mahal" : undefined });
const data = (over: Partial<TravelData> = {}): TravelData => ({
  destinations: [{ query: "Agra", displayName: "Agra, Uttar Pradesh, India", lat: 27.17, lon: 78.04, radiusKm: 12, sourceUrl: "https://www.openstreetmap.org/relation/1" }],
  places: [P("n1", "Taj Mahal", 27.1751, 78.0421), P("n2", "Agra Fort", 27.1795, 78.0211), P("n3", "Mehtab Bagh", 27.1796, 78.0422, 2), P("n4", "Itimad-ud-Daulah", 27.1927, 78.0316, 2)],
  food: [], stays: [], warnings: [], quality: "good", fetchedAt: "2026-11-22T00:00:00.000Z", providers: ["OpenStreetMap (Nominatim, Overpass)", "Wikipedia"], ...over,
});
const act = (placeId: string, title = "Visit", cost = 1100) => ({ time: "9am", title, description: "d", estimatedCost: cost, estimatedTravelTime: "20 min", durationMinutes: 90, placeId });
const day = (n: number, ids: string[]) => ({ day: n, title: `Day ${n}`, morning: [act(ids[0])], afternoon: ids[1] ? [act(ids[1])] : [], evening: [], food: ["Petha"], transport: "Auto", estimatedDailyCost: 5000 });
const bd = { accommodation: 8000, food: 4000, localTransport: 2000, intercityTransport: 3000, tickets: 2200, activities: 1000, miscellaneous: 800 };
const plan = (days: number, over: object = {}) => ({
  title: "Agra Heritage Trip", overview: "o", destinationSummary: "s", bestApproach: "Walk and auto", importantInfo: ["Taj closed Fridays"],
  dailyPlans: Array.from({ length: days }, (_, i) => day(i + 1, i % 2 === 0 ? ["n1", "n3"] : ["n2", "n4"])),
  stays: [], foodRecommendations: [{ dish: "Petha", note: "sweet", placeId: "" }], budgetBreakdown: bd, tips: ["t"], safety: ["s"], ...over,
});
const gemini = (...outs: (object | string | Error)[]) => {
  m.gen.mockReset();
  outs.forEach((o, i) => { const last = i === outs.length - 1; const f = (v: typeof o) => (v instanceof Error ? Promise.reject(v) : Promise.resolve(typeof v === "string" ? v : JSON.stringify(v))); last ? m.gen.mockImplementation(async () => f(o)) : m.gen.mockImplementationOnce(async () => f(o)); });
};
async function user(email: string) { await registerVerified(email); return loginAs(email); }
const gen = (t: string, body: object = input) => request(app).post(`${api}/ai/generate-itinerary`).set(auth(t)).send(body);

describe("AI planner (Gemini + real data)", () => {
  // beforeEach(() => m.fetchData.mockReset().mockResolvedValue(data()));
    beforeEach(() => {
    m.fetchData.mockReset().mockResolvedValue(data());
  });

  it("requires login and validates input; startingLocation is optional", async () => {
    await request(app).post(`${api}/ai/generate-itinerary`).send(input).expect(401);
    const { token } = await user("ai@test.com");
    await gen(token, { ...input, travelStyle: "Chaos" }).expect(400);
    await gen(token, { ...input, duration: undefined }).expect(400);
    await gen(token, { ...input, adults: 0 }).expect(400);
    gemini(plan(2));
    await gen(token, { ...input, startingLocation: undefined }).expect(201);
  });

  it("generates with verified data: hydrates places/coords/sources, estimates, routes; key never leaves the server", async () => {
    gemini("```json\n" + JSON.stringify(plan(2)) + "\n```");
    const { token } = await user("ai@test.com");
    const res = await gen(token).expect(201);
    const it = res.body.data;
    expect(it.dailyPlans).toHaveLength(2);
    expect(it.dailyPlans[0].places).toEqual(["Taj Mahal", "Mehtab Bagh"]);
    expect(it.dailyPlans[0].morning[0].verified).toBe(true);
    expect(it.dailyPlans[0].route).toMatchObject({ distanceKm: 3.2, source: "straight-line" });
    expect(it.attractions.map((a: { id: string }) => a.id).sort()).toEqual(["n1", "n2", "n3", "n4"]);
    expect(it.attractions[0]).toMatchObject({ lat: expect.any(Number), lon: expect.any(Number), sourceUrl: expect.stringContaining("openstreetmap.org") });
    expect(it.estimatedTotalBudget).toBe(21000);
    expect(it.sources.some((s: { kind: string }) => s.kind === "osm")).toBe(true);
    expect(it.aiModel).toBe("test-model"); expect(it.dataQuality).toBe("good"); expect(it.disclaimer).toMatch(/estimates/i);
    const call = m.gen.mock.calls[0][0] as { prompt: string; system: string };
    expect(call.prompt).toContain("n1 | Taj Mahal"); expect(JSON.stringify(res.body)).not.toContain("test-key");
    expect((await request(app).get(`${api}/itineraries`).set(auth(token))).body.data).toHaveLength(1);
  });

  it("generates 1-day, 4-day and 7-day itineraries with the exact number of days", async () => {
    const { token } = await user("ai@test.com");
    for (const n of [1, 4, 7]) {
      gemini(plan(n));
      const r = await gen(token, { ...input, duration: n }).expect(201);
      expect(r.body.data.dailyPlans.map((d: { day: number }) => d.day)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
    }
  });

  it("works for several destinations (circuit passed through to the data layer)", async () => {
    const { token } = await user("ai@test.com");
    for (const destination of ["Varanasi", "Jaipur & Udaipur", "Kerala"]) { gemini(plan(2)); await gen(token, { ...input, destination }).expect(201); expect(m.fetchData.mock.calls.at(-1)![0]).toBe(destination); }
  });

  it("invented placeIds are NOT presented as verified", async () => {
    gemini(plan(2, { dailyPlans: [day(1, ["n1", "zz999"]), day(2, ["n2"])] }));
    const { token } = await user("ai@test.com");
    const it = (await gen(token).expect(201)).body.data;
    expect(it.dailyPlans[0].afternoon[0]).toMatchObject({ verified: false }); expect(it.dailyPlans[0].afternoon[0].placeId).toBeUndefined();
    expect(it.attractions.find((a: { id: string }) => a.id === "zz999")).toBeUndefined();
    expect(it.warnings.join(" ")).toMatch(/unverified/i);
  });

  it("insufficient external data: still generates but everything is flagged unverified", async () => {
    m.fetchData.mockResolvedValue(data({ places: [], quality: "none", warnings: ["Limited verified place data was found; some suggestions are AI-generated and marked unverified."] }));
    gemini(plan(2, { dailyPlans: [day(1, [""]), day(2, [""])] }));
    const { token } = await user("ai@test.com");
    const it = (await gen(token).expect(201)).body.data;
    expect(it.dataQuality).toBe("none"); expect(it.attractions).toHaveLength(0);
    expect(it.dailyPlans[0].morning[0].verified).toBe(false); expect(it.warnings.join(" ")).toMatch(/unverified/i);
  });

  it("invalid destination returns 422 and does not call Gemini", async () => {
    // m.fetchData.mockRejectedValue(new AppError(422, "We couldn't find that destination", "INVALID_DESTINATION"));
        m.fetchData.mockImplementation(async () => { throw new AppError(422, "We couldn't find that destination", "INVALID_DESTINATION"); });
    gemini(plan(2));
    const { token } = await user("ai@test.com");
    const r = await gen(token, { ...input, destination: "Xyzzyqq" }).expect(422);
    expect(r.body.error.code).toBe("INVALID_DESTINATION"); expect(m.gen).not.toHaveBeenCalled();
  });

  it("malformed / invalid AI output: retries once with the problem list, then fails cleanly", async () => {
    const { token } = await user("ai@test.com");
    gemini("not json at all", plan(2)); // retry recovers
    await gen(token).expect(201); expect(m.gen).toHaveBeenCalledTimes(2);
    expect((m.gen.mock.calls[1][0] as { prompt: string }).prompt).toContain("previous reply had these problems");
    gemini(plan(1)); // wrong number of days, persistent
    await gen(token).expect(502);
    gemini(plan(2, { budgetBreakdown: { ...bd, food: -5 } })); // negative money
    await gen(token).expect(502);
    gemini(plan(2, { dailyPlans: [day(2, ["n1"]), day(1, ["n2"])] })); // not sequential
    await gen(token).expect(502);
    gemini(plan(2, { dailyPlans: [day(1, ["n1"]), { ...day(2, ["n2"]), morning: [], afternoon: [] }] })); // empty day
    await gen(token).expect(502);
    await request(app).get(`${api}/health`).expect(200);
  });

  it("budget overrun triggers a correction attempt; if still over it is returned with a warning", async () => {
    const big = { ...bd, accommodation: 90000 };
    gemini(plan(2, { budgetBreakdown: big }), plan(2, { budgetBreakdown: big }));
    const { token } = await user("ai@test.com");
    const it = (await gen(token).expect(201)).body.data;
    expect(m.gen).toHaveBeenCalledTimes(2); expect(it.warnings.join(" ")).toMatch(/exceeds/i);
  });

  it("Gemini upstream errors and rate limits map to clean statuses", async () => {
    const { token } = await user("ai@test.com");
    gemini(new AppError(429, "The AI service quota or rate limit was reached.", "AI_QUOTA"));
    expect((await gen(token).expect(429)).body.error.code).toBe("AI_QUOTA");
    gemini(new AppError(502, "The AI service failed.", "AI_UPSTREAM")); await gen(token).expect(502);
    gemini(new Error("boom")); await gen(token).expect(502);
    await request(app).get(`${api}/health`).expect(200);
  });

  it("streams real progress events when Accept: text/event-stream", async () => {
    gemini(plan(2));
    const { token } = await user("ai@test.com");
    const res = await request(app).post(`${api}/ai/generate-itinerary`).set(auth(token)).set("Accept", "text/event-stream").send(input)
      .buffer(true).parse((r, cb) => { let d = ""; r.on("data", (c: Buffer) => (d += c)); r.on("end", () => cb(null, d)); });
    const body = res.body as string;
    expect(body).toContain("event: progress"); expect(body).toContain("Finding real attractions"); expect(body).toContain("event: result");
  });

  it("destination-info returns verified places without calling Gemini; requires login", async () => {
    await request(app).get(`${api}/ai/destination-info?destination=Agra`).expect(401);
    const { token } = await user("ai@test.com");
    const r = await request(app).get(`${api}/ai/destination-info?destination=Agra`).set(auth(token)).expect(200);
    expect(r.body.data.places.length).toBe(4); expect(m.gen).not.toHaveBeenCalled();
    await request(app).get(`${api}/ai/destination-info?destination=A`).set(auth(token)).expect(400);
  });

  it("a user cannot read, change, share, download, regenerate or delete another user's itinerary", async () => {
    gemini(plan(2));
    const a = await user("a@test.com"); const b = await user("b@test.com");
    const id = (await gen(a.token).expect(201)).body.data._id;
    await request(app).get(`${api}/itineraries/${id}`).set(auth(a.token)).expect(200);
    await request(app).get(`${api}/itineraries/${id}`).set(auth(b.token)).expect(404);
    await request(app).get(`${api}/itineraries/${id}/pdf`).set(auth(b.token)).expect(404);
    await request(app).patch(`${api}/itineraries/${id}`).set(auth(b.token)).send({ title: "pwned" }).expect(404);
    await request(app).post(`${api}/itineraries/${id}/share`).set(auth(b.token)).send({ enable: true }).expect(404);
    await request(app).post(`${api}/ai/regenerate-itinerary`).set(auth(b.token)).send({ itineraryId: id }).expect(404);
    await request(app).post(`${api}/ai/modify-itinerary`).set(auth(b.token)).send({ itineraryId: id, instruction: "make it shorter" }).expect(404);
    await request(app).delete(`${api}/itineraries/${id}`).set(auth(b.token)).expect(404);
    expect((await request(app).get(`${api}/itineraries`).set(auth(b.token))).body.data).toHaveLength(0);
    await request(app).delete(`${api}/itineraries/${id}`).set(auth(a.token)).expect(200);
  });

  it("owner can edit, share (no owner data), download PDF, regenerate one day, regenerate all, and modify", async () => {
    const { token } = await user("own@test.com");
    gemini(plan(2));
    const id = (await gen(token).expect(201)).body.data._id;
    expect((await request(app).patch(`${api}/itineraries/${id}`).set(auth(token)).send({ title: "My Agra" }).expect(200)).body.data.title).toBe("My Agra");
    expect((await request(app).get(`${api}/itineraries/${id}`).set(auth(token)).expect(200)).body.data.title).toBe("My Agra");
    const sh = await request(app).post(`${api}/itineraries/${id}/share`).set(auth(token)).send({ enable: true }).expect(200);
    expect((await request(app).get(`${api}/itineraries/shared/${sh.body.data.shareToken}`).expect(200)).body.data.user).toBeUndefined();
    await request(app).post(`${api}/itineraries/${id}/share`).set(auth(token)).send({ enable: false }).expect(200);
    await request(app).get(`${api}/itineraries/shared/${sh.body.data.shareToken}`).expect(404);
    const pdf = await request(app).get(`${api}/itineraries/${id}/pdf`).set(auth(token)).buffer().expect(200);
    expect(pdf.headers["content-type"]).toMatch(/pdf/);

    gemini({ dailyPlans: [{ ...day(2, ["n4", "n2"]), title: "Replaced day" }] });
    const rg = (await request(app).post(`${api}/ai/regenerate-itinerary`).set(auth(token)).send({ itineraryId: id, day: 2 }).expect(200)).body.data;
    expect(rg.dailyPlans[1].title).toBe("Replaced day"); expect(rg.dailyPlans[1].day).toBe(2); expect(rg.dailyPlans[0].title).toBe("Day 1"); expect(rg.dailyPlans[1].places).toEqual(["Itimad-ud-Daulah", "Agra Fort"]);
    await request(app).post(`${api}/ai/regenerate-itinerary`).set(auth(token)).send({ itineraryId: id, day: 9 }).expect(400);
    gemini(plan(2, { title: "Regenerated" }));
    expect((await request(app).post(`${api}/ai/regenerate-itinerary`).set(auth(token)).send({ itineraryId: id }).expect(200)).body.data.title).toBe("Regenerated");
    gemini(plan(2, { title: "Modified Trip" }));
    expect((await request(app).post(`${api}/ai/modify-itinerary`).set(auth(token)).send({ itineraryId: id, instruction: "more food stops" }).expect(200)).body.data.title).toBe("Modified Trip");
  });
});
