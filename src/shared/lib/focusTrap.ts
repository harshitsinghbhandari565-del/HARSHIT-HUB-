/**
 * Focus trap — keyboard focus stays inside a container while active
 * (Design §25.2 focus trapping for the mobile menu and overlays).
 * Escape handling is the consumer's responsibility; the trap only
 * constrains Tab / Shift+Tab.
 *
 * Pure DOM utility (TAD §5 shared/lib) — no framework dependency.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  // The trap is only active while its container is visible, so the filter
  // excludes explicitly-hidden elements rather than computing layout
  // visibility (which also keeps the utility testable under jsdom).
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true',
  );
}

export interface FocusTrap {
  activate: () => void;
  deactivate: () => void;
}

/**
 * Create a trap for a container. `activate` listens for Tab at the
 * document level (so focus that has strayed outside the container is
 * pulled back in) and wraps focus at the edges; `deactivate` removes the
 * listener. Callers move focus in/out themselves (Design §25.2: focus
 * returns to the trigger on close).
 */
export function createFocusTrap(container: HTMLElement): FocusTrap {
  const ownerDocument = container.ownerDocument;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;
    const focusable = getFocusableElements(container);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = ownerDocument.activeElement as HTMLElement | null;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    } else if (!container.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  };

  return {
    activate: () => ownerDocument.addEventListener('keydown', onKeyDown),
    deactivate: () => ownerDocument.removeEventListener('keydown', onKeyDown),
  };
}
