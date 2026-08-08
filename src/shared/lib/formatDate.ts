/**
 * Shared date formatting (TAD §5, §8.3): en-IN medium style, e.g.
 * "1 Aug 2026". Pure — testable in node.
 */
const formatter = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

export function formatDate(date: Date): string {
  return formatter.format(date);
}
