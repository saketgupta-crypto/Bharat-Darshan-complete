import { describe, expect, it } from "vitest";
import { clusterPoints, decimate, haversineKm, maxSpreadKm, validCoord } from "../src/services/travel/geo";
import { splitDestination } from "../src/services/travel/places.service";
import { toAiError } from "../src/services/gemini.service";

describe("geo helpers", () => {
  it("haversine is accurate (Delhi-Agra ~180 km) and symmetric", () => {
    const d = haversineKm({ lat: 28.6139, lon: 77.209 }, { lat: 27.1767, lon: 78.0081 });
    expect(d).toBeGreaterThan(170); expect(d).toBeLessThan(195);
    expect(haversineKm({ lat: 1, lon: 1 }, { lat: 1, lon: 1 })).toBe(0);
  });
  it("validates coordinates", () => { expect(validCoord(27, 78)).toBe(true); expect(validCoord(95, 0)).toBe(false); expect(validCoord(NaN, 1)).toBe(false); expect(validCoord("1", 1)).toBe(false); });
  it("clusters nearby places together and far ones apart", () => {
    const pts = [{ lat: 27.17, lon: 78.04 }, { lat: 27.18, lon: 78.03 }, { lat: 26.91, lon: 75.78 }, { lat: 26.92, lon: 75.8 }];
    const c = clusterPoints(pts, 2);
    expect(c[0]).toBe(c[1]); expect(c[2]).toBe(c[3]); expect(c[0]).not.toBe(c[2]);
    expect(maxSpreadKm(pts)).toBeGreaterThan(200); expect(clusterPoints([], 3)).toEqual([]);
  });
  it("decimate keeps endpoints", () => { const r = decimate(Array.from({ length: 1000 }, (_, i) => i), 50); expect(r).toHaveLength(50); expect(r[0]).toBe(0); expect(r.at(-1)).toBe(999); });
  it("splits circuits into searchable parts", () => {
    expect(splitDestination("Jaipur & Udaipur, Kerala")).toEqual(["Jaipur", "Udaipur", "Kerala"]);
    expect(splitDestination("Varanasi")).toEqual(["Varanasi"]);
  });
  it("maps Gemini/SDK errors to clean app errors", () => {
    expect(toAiError({ status: 429 })).toMatchObject({ statusCode: 429, code: "AI_QUOTA" });
    expect(toAiError({ status: 403 })).toMatchObject({ statusCode: 503, code: "AI_NOT_CONFIGURED" });
    expect(toAiError({ status: 404 })).toMatchObject({ statusCode: 503 });
    expect(toAiError({ status: 503 })).toMatchObject({ statusCode: 502, code: "AI_UPSTREAM" });
    expect(toAiError(Object.assign(new Error("x"), { name: "AbortError" }))).toMatchObject({ statusCode: 504, code: "AI_TIMEOUT" });
  });
});
