export type Verification = "osm" | "osm+wikipedia" | "unverified";
export interface Place {
  id: string;                 // stable id: "n123" / "w456" / "r789" (OSM element)
  name: string;
  category: string;           // e.g. "temple", "museum", "fort", "park"
  lat: number;
  lon: number;
  address?: string;
  description?: string;       // from Wikipedia summary when available
  openingHours?: string;      // raw OSM tag, may be stale -> always "verify"
  fee?: string;               // raw OSM "fee" tag (yes/no) - never a price
  website?: string;
  sourceUrl: string;          // OSM element page (always present) 
  wikipediaUrl?: string;
  wikidataId?: string;
  verification: Verification;
  cluster?: number;           // geographic day-cluster hint
  score?: number;
}
export interface ResolvedDestination {
  query: string; displayName: string; lat: number; lon: number;
  osmType?: string; osmId?: number; boundingbox?: [number, number, number, number]; // south, north, west, east
  radiusKm: number; sourceUrl: string;
}
export interface TravelData {
  destinations: ResolvedDestination[];
  places: Place[];
  food: Place[];
  stays: Place[];
  warnings: string[];
  quality: "good" | "limited" | "none";
  fetchedAt: string;
  providers: string[];
}
export interface RouteInfo {
  distanceKm: number; durationMin?: number; source: "osrm" | "straight-line";
  coordinates?: [number, number][]; // [lon, lat]
}
