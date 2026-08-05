/**
 * Personal recency — the "Recently used" rail (FR-3, Design §13.2).
 * Per-visitor localStorage history of launched presentations:
 * latest-first, max RECENCY_MAX entries, corrupt/foreign data discarded.
 * Pure logic with injected storage (unit-testable in node; islands guard
 * every real access — Safari private mode throws).
 */

export const RECENCY_STORAGE_KEY = 'recentPresentations';
export const RECENCY_MAX = 5;

export interface RecencyEntry {
  slug: string;
  at: number;
}

function isValidEntry(value: unknown): value is RecencyEntry {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as RecencyEntry).slug === 'string' &&
    typeof (value as RecencyEntry).at === 'number'
  );
}

/** Read and validate the stored recency list; anything malformed yields []. */
export function readRecency(
  storage: Storage | undefined = globalThis.localStorage,
): RecencyEntry[] {
  try {
    const raw = storage?.getItem(RECENCY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

/**
 * Record a launch: newest first, deduplicated by slug, capped at
 * RECENCY_MAX. Blocked storage is a silent no-op (the rail simply
 * falls back to "Latest").
 */
export function writeRecency(
  slug: string,
  now: number = Date.now(),
  storage: Storage | undefined = globalThis.localStorage,
): void {
  try {
    const entries = readRecency(storage).filter((e) => e.slug !== slug);
    entries.unshift({ slug, at: now });
    storage?.setItem(RECENCY_STORAGE_KEY, JSON.stringify(entries.slice(0, RECENCY_MAX)));
  } catch {
    // Storage unavailable — recency is an enhancement, not a contract.
  }
}

/**
 * Resolve the rail's display order (Design §13.2 dual strategy):
 * keep only recency slugs that still exist among the published cards,
 * newest first; the caller shows the server-rendered "Latest" order when
 * the result is empty (no flicker, no work — TAD §10.4).
 */
export function resolveRecentSlugs(
  recency: RecencyEntry[],
  existingSlugs: ReadonlyArray<string>,
  max: number = 3,
): string[] {
  const existing = new Set(existingSlugs);
  return recency
    .map((e) => e.slug)
    .filter((slug) => existing.has(slug))
    .slice(0, max);
}
