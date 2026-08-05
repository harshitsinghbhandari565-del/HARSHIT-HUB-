/**
 * Search trigger wiring (D-044). Document-level delegation: ClientRouter
 * swaps the whole <body> without re-running identical scripts, so an
 * element-bound listener would die after the first navigation. The dialog
 * is modal, so no swap can happen while it is open and the trigger it
 * closes back to is always the current one (search-mount owns the rest of
 * the lifecycle — D-038 dynamic import on first click keeps search JS off
 * pages where nobody searches, TAD §14.1).
 */
export function initSearchTrigger(doc: Document): void {
  doc.addEventListener('click', async (event) => {
    const trigger = (event.target as Element | null)?.closest('[data-search-trigger]');
    if (!(trigger instanceof HTMLElement)) return;
    const { openSearchDialog } = await import('../islands/search-mount');
    void openSearchDialog(trigger);
  });
}
