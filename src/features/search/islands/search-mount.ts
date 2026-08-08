/**
 * On-demand search dialog mount (D-038). The header trigger is a plain
 * button with a tiny bundled script; the FIRST click dynamically imports
 * Preact + SearchDialog, so pages where nobody searches never pay for
 * search JS (TAD §14.1). The dialog unmounts on close and focus returns
 * to the trigger (Design: focus returns to the trigger).
 */
import { h, render } from 'preact';

let hostEl: HTMLDivElement | null = null;
let openCount = 0;

export async function openSearchDialog(triggerEl: HTMLElement): Promise<void> {
  if (!hostEl) {
    hostEl = document.createElement('div');
    document.body.appendChild(hostEl);
  }

  const { default: SearchDialog } = await import('./SearchDialog');
  triggerEl.setAttribute('aria-expanded', 'true');
  openCount += 1;

  render(
    h(SearchDialog, {
      onClose: () => {
        openCount -= 1;
        if (hostEl) render(null, hostEl);
        triggerEl.setAttribute('aria-expanded', 'false');
        triggerEl.focus();
      },
    }),
    hostEl,
  );
}

/** Test helper: whether a dialog is currently mounted. */
export function isDialogMounted(): boolean {
  return openCount > 0;
}

/** Test helper: drop module state between jsdom environments. */
export function __resetMountForTests(): void {
  hostEl = null;
  openCount = 0;
}
