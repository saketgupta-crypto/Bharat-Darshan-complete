import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { cached, makeThrottle } from "./cache";
import { clusterPoints, decimate, haversineKm, validCoord } from "./geo";
import { getJson } from "./http";
import type { Place, ResolvedDestination, RouteInfo, TravelData } from "./types";

const nominatimGate = makeThrottle(1100);   // Nominatim policy: <= 1 request/second
const overpassGate = makeThrottle(1500);
const DAY = 24 * 3600_000;

interface NominatimHit { lat: string; lon: string; display_name: string; osm_type?: string; osm_id?: number; boundingbox?: string[]; addresstype?: string; class?: string; type?: string }

/** Split a circuit like "Jaipur & Udaipur, Kerala" into at most 4 searchable parts. */
export const splitDestination = (q: string): string[] =>
  [...new Set(q.split(/\s*(?:&|,|\+|\band\b|\bto\b|->|→|\/)\s*/i).map((s) => s.trim()).filter((s) => s.length >= 2))].slice(0, 4);

export async function geocode(query: string): Promise<ResolvedDestination | null> {
  const key = `geo:${query.toLowerCase()}`;
  return cached(key, 7 * DAY, async () => {
    const url = `${env.NOMINATIM_URL}/search?format=jsonv2&limit=1&countrycodes=in&addressdetails=0&q=${encodeURIComponent(query)}`;
    const hits = await nominatimGate(() => getJson<NominatimHit[]>(url));
    const h = hits[0];
    if (!h) return null;
    const lat = Number(h.lat), lon = Number(h.lon);
    if (!validCoord(lat, lon)) return null;
    const bb = h.boundingbox?.map(Number);
    const bbox = bb && bb.length === 4 && bb.every(Number.isFinite) ? ([bb[0], bb[1], bb[2], bb[3]] as [number, number, number, number]) : undefined;
    const span = bbox ? Math.max(haversineKm({ lat: bbox[0], lon: bbox[2] }, { lat: bbox[1], lon: bbox[3] }) / 2, 3) : 12;
    return {
      query, displayName: h.display_name, lat, lon, osmType: h.osm_type, osmId: h.osm_id, boundingbox: bbox,
      radiusKm: Math.min(Math.max(span, 5), 25), // cap the search radius to keep Overpass polite
      sourceUrl: h.osm_type && h.osm_id ? `https://www.openstreetmap.org/${h.osm_type}/${h.osm_id}` : `https://www.openstreetmap.org/#map=12/${lat}/${lon}`,
    };
  });
}

interface OverpassEl { type: "node" | "way" | "relation"; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }

const ATTRACTION_FILTERS = [
  `["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|artwork)$"]`,
  `["historic"~"^(monument|memorial|fort|castle|palace|ruins|archaeological_site|temple|city_gate|building)$"]`,
  `["amenity"="place_of_worship"]["wikidata"]`,
  `["leisure"~"^(park|garden|nature_reserve)$"]["wikidata"]`,
  `["natural"~"^(waterfall|peak|beach|hot_spring)$"]["name"]`,
  `["man_made"~"^(lighthouse|tower)$"]["tourism"]`,
];

const catOf = (t: Record<string, string>): string => {
  if (t.historic === "fort" || t.historic === "castle") return "fort";
  if (t.historic === "palace") return "palace";
  if (t.amenity === "place_of_worship") return t.religion === "hindu" ? "temple" : t.religion === "muslim" ? "mosque" : t.religion === "sikh" ? "gurdwara" : t.religion === "buddhist" ? "monastery" : t.religion === "christian" ? "church" : "place of worship";
  return t.tourism || t.historic || t.leisure || t.natural || "attraction";
};
const addr = (t: Record<string, string>) =>
  [t["addr:housename"], t["addr:street"], t["addr:suburb"] ?? t["addr:city"], t["addr:postcode"]].filter(Boolean).join(", ") || undefined;
const siteUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : undefined);

function toPlace(el: OverpassEl): Place | null {
  const t = el.tags ?? {};
  const name = t["name:en"] || t.name;
  const lat = el.lat ?? el.center?.lat, lon = el.lon ?? el.center?.lon;
  if (!name || !validCoord(lat, lon)) return null;
  const letter = el.type === "node" ? "n" : el.type === "way" ? "w" : "r";
  const wikiTitle = t["wikipedia"]?.startsWith("en:") ? t["wikipedia"].slice(3) : undefined;
  return {
    id: `${letter}${el.id}`, name, category: catOf(t), lat: lat as number, lon: lon as number, address: addr(t),
    openingHours: t.opening_hours, fee: t.fee, website: siteUrl(t.website ?? t["contact:website"]),
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    wikipediaUrl: wikiTitle ? `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiTitle.replace(/ /g, "_"))}` : undefined,
    wikidataId: t.wikidata, verification: "osm",
    score: (t.wikidata ? 3 : 0) + (t.wikipedia ? 2 : 0) + (t.tourism === "attraction" || t.tourism === "museum" ? 2 : 0) + (t.heritage ? 1 : 0) + (t.website ? 0.5 : 0) + (t.opening_hours ? 0.5 : 0),
  };
}

async function overpass(query: string): Promise<OverpassEl[]> {
  const j = await overpassGate(() => getJson<{ elements?: OverpassEl[] }>(env.OVERPASS_URL, {
    method: "POST", body: `data=${encodeURIComponent(query)}`, timeoutMs: 25_000, headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }));
  return j.elements ?? [];
}

async function fetchAround(d: ResolvedDestination, filters: string[], limit: number): Promise<Place[]> {
  const r = Math.round(d.radiusKm * 1000);
  const body = filters.map((f) => `nwr${f}["name"](around:${r},${d.lat},${d.lon});`).join("");
  const els = await cached(`ovp:${d.lat.toFixed(3)},${d.lon.toFixed(3)}:${r}:${filters.join("").length}:${limit}`, 6 * 3600_000,
    () => overpass(`[out:json][timeout:20];(${body});out center ${limit};`));
  const seen = new Set<string>();
  return els.map(toPlace).filter((p): p is Place => !!p && !seen.has(p.name.toLowerCase()) && !!seen.add(p.name.toLowerCase()));
}

async function wikiSummary(p: Place): Promise<Place> {
  if (!p.wikipediaUrl) return p;
  const title = p.wikipediaUrl.split("/wiki/")[1];
  try {
    const s = await cached(`wiki:${title}`, 7 * DAY, () => getJson<{ extract?: string; content_urls?: { desktop?: { page?: string } } }>(`${env.WIKIPEDIA_API_URL}/page/summary/${title}`, { timeoutMs: 8000 }));
    if (s.extract) return { ...p, description: s.extract.slice(0, 400), wikipediaUrl: s.content_urls?.desktop?.page ?? p.wikipediaUrl, verification: "osm+wikipedia" };
  } catch { /* Wikipedia is optional */ }
  return p;
}

export interface TravelDataOptions { interests: string[]; duration: number; wantFood: boolean; wantStays: boolean }

/** Resolves the destination(s) and gathers real POIs. Throws INVALID_DESTINATION if nothing can be geocoded. */
export async function fetchTravelData(destination: string, o: TravelDataOptions): Promise<TravelData> {
  const warnings: string[] = [];
  const parts = splitDestination(destination);
  const dests: ResolvedDestination[] = [];
  for (const part of parts.length ? parts : [destination]) {
    try {
      const d = await geocode(part);
      if (d) dests.push(d); else warnings.push(`Could not find "${part}" in OpenStreetMap.`);
    } catch { warnings.push(`Location lookup for "${part}" is temporarily unavailable.`); }
  }
  if (!dests.length) {
    throw new AppError(422, "We couldn't find that destination in India. Try a city, town or well-known place name (e.g. Varanasi, Jaipur).", "INVALID_DESTINATION");
  }
  const perDest = Math.max(15, Math.ceil(70 / dests.length));
  let places: Place[] = [], food: Place[] = [], stays: Place[] = [];
  for (const d of dests) {
    try { places.push(...(await fetchAround(d, ATTRACTION_FILTERS, perDest * 3)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, perDest)); }
    catch { warnings.push(`Attraction data for ${d.query} is temporarily unavailable (Overpass).`); }
    if (o.wantFood) { try { food.push(...(await fetchAround(d, [`["amenity"~"^(restaurant|cafe|food_court)$"]["cuisine"]`], 40)).slice(0, 8)); } catch { /* optional */ } }
    if (o.wantStays) { try { stays.push(...(await fetchAround(d, [`["tourism"~"^(hotel|guest_house|hostel)$"]`], 30)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 6)); } catch { /* optional */ } }
  }
  places = await Promise.all(places.map((p, i) => (i < 20 ? wikiSummary(p) : p)));
  const clusters = clusterPoints(places, Math.max(1, o.duration));
  places.forEach((p, i) => { p.cluster = clusters[i] + 1; });
  const quality = places.length >= Math.max(3, o.duration) ? "good" : places.length > 0 ? "limited" : "none";
  if (quality !== "good") warnings.push("Limited verified place data was found; some suggestions are AI-generated and marked unverified.");
  return { destinations: dests, places, food, stays, warnings, quality, fetchedAt: new Date().toISOString(), providers: ["OpenStreetMap (Nominatim, Overpass)", "Wikipedia"] };
}

/** Road route via OSRM when available, otherwise straight-line distance (clearly labelled). Never live traffic. */
export async function routeFor(stops: { lat: number; lon: number }[]): Promise<RouteInfo | null> {
  if (stops.length < 2) return null;
  const straight = (): RouteInfo => ({ distanceKm: Math.round(stops.slice(1).reduce((s, p, i) => s + haversineKm(stops[i], p), 0) * 10) / 10, source: "straight-line" });
  if (!env.OSRM_URL) return straight();
  try {
    const coords = stops.map((s) => `${s.lon},${s.lat}`).join(";");
    const j = await cached(`osrm:${coords}`, DAY, () => getJson<{ code: string; routes?: { distance: number; duration: number; geometry?: { coordinates: [number, number][] } }[] }>(
      `${env.OSRM_URL}/route/v1/driving/${coords}?overview=simplified&geometries=geojson`, { timeoutMs: 8000 }));
    const r = j.code === "Ok" ? j.routes?.[0] : undefined;
    if (!r) return straight();
    return { distanceKm: Math.round(r.distance / 100) / 10, durationMin: Math.round(r.duration / 60), source: "osrm", coordinates: r.geometry ? decimate(r.geometry.coordinates, 150) : undefined };
  } catch { return straight(); }
}
