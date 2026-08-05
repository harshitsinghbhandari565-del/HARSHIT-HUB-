/**
 * Scored search matcher (Dev Plan T-F2, TAD §11.2).
 *
 * Hand-rolled by design (ADR-0010): ~40 lines beat 12–25 KB of fuzzy
 * matching for a corpus a user can read in full. Semantics per TAD:
 * every query token must match somewhere (AND); per-token score is the
 * best field hit — title exact 100, title prefix 60, title substring 40,
 * subject match 30, tag exact 25, tag prefix 15 — and documents sort by
 * total score descending, then date descending.
 *
 * Pure and synchronous: results come from an in-memory array, so
 * out-of-order responses are structurally impossible (TAD §11.4).
 */

import { normalizeText, tokenize } from './normalize';

/** Index document — shortened keys keep the payload tiny (TAD §11.2). */
export interface SearchDoc {
  /** slug */
  s: string;
  /** title */
  t: string;
  /** subject */
  u: string;
  /** tags */
  g: string[];
  /** date (ISO) */
  d: string;
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
}

const SCORE = {
  titleExact: 100,
  titlePrefix: 60,
  titleSubstring: 40,
  subject: 30,
  tagExact: 25,
  tagPrefix: 15,
} as const;

/** Best field score for one normalized token against one document; 0 = no hit. */
function scoreToken(token: string, doc: SearchDoc): number {
  const title = normalizeText(doc.t);
  if (title === token) return SCORE.titleExact;
  if (title.startsWith(token)) return SCORE.titlePrefix;

  const subject = normalizeText(doc.u);
  const subjectHit = subject === token || subject.includes(token);

  let tagScore = 0;
  for (const raw of doc.g) {
    const tag = normalizeText(raw);
    if (tag === token) {
      tagScore = SCORE.tagExact;
      break;
    }
    if (tag.startsWith(token) && tagScore < SCORE.tagPrefix) {
      tagScore = SCORE.tagPrefix;
    }
  }

  if (title.includes(token)) return Math.max(SCORE.titleSubstring, subjectHit ? SCORE.subject : 0, tagScore);
  if (subjectHit) return Math.max(SCORE.subject, tagScore);
  return tagScore;
}

/** Does a single document satisfy the query (AND across tokens)? */
export function docMatches(query: string, doc: SearchDoc): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return false;
  return tokens.every((token) => scoreToken(token, doc) > 0);
}

/**
 * Match a query against documents. Empty/whitespace-only queries return
 * no results (the UI shows its prompt state rather than the full list).
 */
export function searchDocs(query: string, docs: readonly SearchDoc[]): SearchResult[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];
  for (const doc of docs) {
    let total = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const tokenScore = scoreToken(token, doc);
      if (tokenScore === 0) {
        matchedAll = false;
        break;
      }
      total += tokenScore;
    }
    if (matchedAll) results.push({ doc, score: total });
  }

  return results.sort(
    (a, b) => b.score - a.score || b.doc.d.localeCompare(a.doc.d),
  );
}
