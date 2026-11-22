import { z } from "zod";

export const TRAVEL_STYLES = ["Adventure", "Spiritual", "Historical", "Nature", "Luxury", "Budget", "Family", "Romantic", "Cultural"] as const;

export const planInputSchema = z
  .object({
    startingLocation: z.string().trim().max(100).default(""),
    destination: z.string().trim().min(2).max(100),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    duration: z.coerce.number().int().min(1).max(30).optional(),
    adults: z.coerce.number().int().min(1).max(20).default(1),
    children: z.coerce.number().int().min(0).max(20).default(0),
    budget: z.coerce.number().min(0).max(100_000_000).default(0),
    travelStyle: z.enum(TRAVEL_STYLES),
    transportation: z.string().trim().max(40).default("Any"),
    accommodation: z.string().trim().max(40).default("Any"),
    interests: z.array(z.string().trim().max(40)).max(15).default([]),
    dietary: z.string().trim().max(80).default(""),
    specialRequirements: z.string().trim().max(500).default(""),
  })
  .refine((d) => d.duration || (d.startDate && d.endDate), { message: "Provide a duration or both start and end dates", path: ["duration"] })
  .refine((d) => !d.startDate || !d.endDate || d.endDate >= d.startDate, { message: "End date must be after start date", path: ["endDate"] });
export type PlanInput = z.infer<typeof planInputSchema>;

export const resolveDuration = (i: PlanInput) =>
  i.duration ?? Math.min(30, Math.max(1, Math.round((i.endDate!.getTime() - i.startDate!.getTime()) / 86_400_000) + 1));

// ---- Raw Gemini output (strict: negatives / wrong types are reported as problems, not silently zeroed) ----
const money = z.coerce.number().finite().nonnegative();
const txt = z.string().default("");
const rawActivity = z.object({
  time: txt, title: z.string().min(1), description: txt, estimatedCost: money.default(0), estimatedTravelTime: txt,
  durationMinutes: z.coerce.number().int().nonnegative().max(1440).default(0), placeId: z.string().default(""),
});
const rawDay = z.object({
  day: z.coerce.number().int().min(1), title: z.string().min(1),
  morning: z.array(rawActivity).default([]), afternoon: z.array(rawActivity).default([]), evening: z.array(rawActivity).default([]),
  food: z.array(z.string()).default([]), transport: txt, estimatedDailyCost: money.default(0),
});
const breakdown = z.object({ accommodation: money, food: money, localTransport: money, intercityTransport: money, tickets: money, activities: money, miscellaneous: money });
export const rawResultSchema = z.object({
  title: z.string().min(1), overview: txt, destinationSummary: txt, bestApproach: txt,
  importantInfo: z.array(z.string()).default([]),
  dailyPlans: z.array(rawDay).min(1),
  stays: z.array(z.object({ placeId: z.string().default(""), name: txt, note: txt })).default([]),
  foodRecommendations: z.array(z.object({ dish: z.string().min(1), note: txt, placeId: z.string().default("") })).default([]),
  budgetBreakdown: breakdown,
  tips: z.array(z.string()).default([]), safety: z.array(z.string()).default([]),
});
export type RawResult = z.infer<typeof rawResultSchema>;
export const rawDaysOnlySchema = z.object({ dailyPlans: z.array(rawDay).min(1) });

// ---- Stored / returned shapes ----
export interface Attraction {
  id: string; name: string; category: string; description?: string; address?: string; lat: number; lon: number;
  openingHours?: string; fee?: string; website?: string; sourceUrl: string; wikipediaUrl?: string;
  verification: "osm" | "osm+wikipedia"; verifiedAt: string;
}
export interface SourceRef { title: string; url: string; kind: "osm" | "wikipedia" | "grounding" | "routing" }
export interface StoredActivity { time?: string; title: string; description?: string; estimatedCost: number; estimatedTravelTime?: string; durationMinutes?: number; placeId?: string; verified: boolean }
export interface StoredDay {
  day: number; title: string; morning: StoredActivity[]; afternoon: StoredActivity[]; evening: StoredActivity[];
  places: string[]; placeIds: string[]; food: string[]; transport: string; estimatedDailyCost: number;
  route?: { distanceKm: number; durationMin?: number; source: "osrm" | "straight-line"; coordinates?: [number, number][] };
}
export interface AiResult {
  title: string; overview: string; destinationSummary: string; bestApproach: string; importantInfo: string[];
  dailyPlans: StoredDay[];
  accommodationSuggestions: string[];
  accommodationPlaces: { name: string; address?: string; lat: number; lon: number; sourceUrl: string }[];
  foodRecommendations: { dish: string; note: string; place?: string; sourceUrl?: string }[];
  estimatedTotalBudget: number;
  budgetBreakdown: { accommodation: number; food: number; localTransport: number; intercityTransport: number; tickets: number; activities: number; miscellaneous: number };
  tips: string[]; safety: string[];
  attractions: Attraction[]; sources: SourceRef[]; warnings: string[];
  dataQuality: "good" | "limited" | "none"; verifiedAt: string; dataProviders: string[]; groundedNotes: string[];
}
export const RESULT_KEYS: (keyof AiResult)[] = [
  "title", "overview", "destinationSummary", "bestApproach", "importantInfo", "dailyPlans", "accommodationSuggestions", "accommodationPlaces",
  "foodRecommendations", "estimatedTotalBudget", "budgetBreakdown", "tips", "safety", "attractions", "sources", "warnings", "dataQuality", "verifiedAt", "dataProviders", "groundedNotes",
];

// ---- Gemini responseSchema (OpenAPI subset). Zod above remains the source of truth. ----
const S = { type: "STRING" }, N = { type: "NUMBER" };
const arr = (items: object) => ({ type: "ARRAY", items });
const obj = (properties: Record<string, object>) => ({ type: "OBJECT", properties, required: Object.keys(properties) });
const activity = obj({ time: S, title: S, description: S, estimatedCost: N, estimatedTravelTime: S, durationMinutes: N, placeId: S });
const day = obj({ day: N, title: S, morning: arr(activity), afternoon: arr(activity), evening: arr(activity), food: arr(S), transport: S, estimatedDailyCost: N });
export const GEMINI_DAYS_SCHEMA = obj({ dailyPlans: arr(day) });
export const GEMINI_RESULT_SCHEMA = obj({
  title: S, overview: S, destinationSummary: S, bestApproach: S, importantInfo: arr(S), dailyPlans: arr(day),
  stays: arr(obj({ placeId: S, name: S, note: S })),
  foodRecommendations: arr(obj({ dish: S, note: S, placeId: S })),
  budgetBreakdown: obj({ accommodation: N, food: N, localTransport: N, intercityTransport: N, tickets: N, activities: N, miscellaneous: N }),
  tips: arr(S), safety: arr(S),
});
