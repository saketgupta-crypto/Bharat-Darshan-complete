// Small in-memory TTL cache + a serial throttle for polite use of free public APIs.
// NOTE: process-local. On Render's free tier the cache resets when the instance sleeps/restarts.
const store = new Map<string, { exp: number; v: unknown }>();
const MAX_ENTRIES = 500;

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.exp > Date.now()) return hit.v as T;
  const v = await load();
  if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value as string);
  store.set(key, { exp: Date.now() + ttlMs, v });
  return v;
}
export const clearCache = () => store.clear();

/** Runs tasks one at a time with at least `gapMs` between starts (Nominatim policy: max 1 req/s). */
export function makeThrottle(gapMs: number) {
  let chain: Promise<unknown> = Promise.resolve();
  let last = 0;
  return <T>(fn: () => Promise<T>): Promise<T> => {
    const run = chain.then(async () => {
      const wait = last + gapMs - Date.now();
      if (wait > 0 && process.env.NODE_ENV !== "test") await new Promise((r) => setTimeout(r, wait));
      last = Date.now();
      return fn();
    });
    chain = run.catch(() => undefined);
    return run;
  };
}
