// Pure geographic helpers (no I/O) so they are easy to unit-test.
export interface LatLon { lat: number; lon: number }

export const validCoord = (lat: unknown, lon: unknown): boolean =>
  typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;

/** Great-circle ("straight-line") distance in km. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a path visiting points in the given order. */
export const pathKm = (pts: LatLon[]): number => pts.slice(1).reduce((s, p, i) => s + haversineKm(pts[i], p), 0);

/** Largest pairwise distance in a set of points (the "spread" of a day). */
export function maxSpreadKm(pts: LatLon[]): number {
  let m = 0;
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) m = Math.max(m, haversineKm(pts[i], pts[j]));
  return m;
}

/** Deterministic k-means (farthest-point init) used to pre-group nearby places into day clusters. */
export function clusterPoints<T extends LatLon>(items: T[], k: number): number[] {
  const n = items.length;
  if (n === 0) return [];
  k = Math.max(1, Math.min(k, n));
  const centers: LatLon[] = [{ lat: items[0].lat, lon: items[0].lon }];
  while (centers.length < k) {
    let best = -1, bestD = -1;
    items.forEach((p, i) => {
      const d = Math.min(...centers.map((c) => haversineKm(p, c)));
      if (d > bestD) { bestD = d; best = i; }
    });
    centers.push({ lat: items[best].lat, lon: items[best].lon });
  }
  let assign = new Array<number>(n).fill(0);
  for (let iter = 0; iter < 10; iter++) {
    assign = items.map((p) => centers.reduce((bi, c, ci) => (haversineKm(p, c) < haversineKm(p, centers[bi]) ? ci : bi), 0));
    centers.forEach((_, ci) => {
      const m = items.filter((_, i) => assign[i] === ci);
      if (m.length) centers[ci] = { lat: m.reduce((s, p) => s + p.lat, 0) / m.length, lon: m.reduce((s, p) => s + p.lon, 0) / m.length };
    });
  }
  return assign;
}

/** Thin a polyline to at most `max` points (keeps first and last). */
export function decimate<T>(pts: T[], max: number): T[] {
  if (pts.length <= max) return pts;
  const step = (pts.length - 1) / (max - 1);
  return Array.from({ length: max }, (_, i) => pts[Math.round(i * step)]);
}
