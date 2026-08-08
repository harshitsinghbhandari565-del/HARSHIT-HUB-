/**
 * Presentation URL derivation (TAD §8.3 — derive, never duplicate).
 * The schema already guarantees googleSlidesUrl ends in /present; these
 * helpers normalize defensively (belt-and-braces, Dev Plan §11.4) and
 * build the Dropbox backup URL per ADR-0012.
 */

/** Ensure a Google Slides document URL opens in presentation mode. */
export function normalizeSlidesUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Rewrite any trailing mode segment (edit/view/embed…) to /present.
    parsed.pathname = parsed.pathname.replace(/\/(edit|view|embed)?\/?$/, '/present');
    if (!parsed.pathname.endsWith('/present')) {
      parsed.pathname = `${parsed.pathname.replace(/\/$/, '')}/present`;
    }
    parsed.search = '';
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Dropbox backup URL (ADR-0012): ?dl=0 in-browser preview by default —
 * panels may not open a downloaded .pptx. forceDownload opts an item into
 * ?dl=1. Existing dl params are replaced, other query params preserved.
 */
export function buildBackupUrl(dropboxUrl: string, forceDownload: boolean): string {
  try {
    const parsed = new URL(dropboxUrl);
    parsed.searchParams.set('dl', forceDownload ? '1' : '0');
    return parsed.toString();
  } catch {
    return dropboxUrl;
  }
}
