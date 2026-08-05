/**
 * MobileMenu behaviour (D-044) — vanilla rewrite of the Phase C Preact
 * island. The menu is trigger + panel state with a focus trap: exactly
 * the kind of chrome that needs no framework, and hydrating it as an
 * island dragged ~8 KB of Preact onto every island-free route at mobile
 * widths — pushing /presentations/[slug] past its TAD §14.1 JS budget.
 *
 * Accessibility contract (Design §25.2, Gate 2) — unchanged:
 * - trigger carries aria-expanded/aria-controls
 * - opening moves focus to the close button; closing returns it to the
 *   trigger
 * - focus is trapped while open; Escape closes
 * - the rest of the page receives `inert` while the menu is open
 * - body scroll is locked while open
 *
 * Listeners use document-level delegation (D-044): ClientRouter swaps the
 * whole <body> without re-running identical scripts, so element-bound
 * listeners would die after the first navigation. The menu is modal — no
 * swap can happen while it is open — so per-open state (trap, scroll
 * lock) never spans a navigation.
 */
import { createFocusTrap, type FocusTrap } from './focusTrap';

const TOGGLE_SELECTOR = '[data-menu-toggle]';
const CLOSE_SELECTOR = '[data-menu-close]';
const PANEL_ID = 'mobile-menu-panel';

export function initMobileMenu(doc: Document): void {
  let trap: FocusTrap | null = null;
  let previousOverflow = '';

  const getTrigger = () => doc.querySelector<HTMLButtonElement>(TOGGLE_SELECTOR);
  const getPanel = () => doc.getElementById(PANEL_ID);
  const isOpen = () => getTrigger()?.getAttribute('aria-expanded') === 'true';

  const setOpen = (open: boolean) => {
    const trigger = getTrigger();
    const panel = getPanel();
    if (!trigger || !panel) return;

    trigger.setAttribute('aria-expanded', String(open));

    if (open) {
      trap = createFocusTrap(panel);
      trap.activate();
      panel.removeAttribute('inert');
      panel.toggleAttribute('data-open', true);
      previousOverflow = doc.documentElement.style.overflow;
      doc.documentElement.style.overflow = 'hidden';
      for (const el of [doc.querySelector('main'), doc.querySelector('footer')]) {
        el?.setAttribute('inert', '');
      }
      panel.querySelector<HTMLButtonElement>(CLOSE_SELECTOR)?.focus();
    } else {
      trap?.deactivate();
      trap = null;
      panel.toggleAttribute('data-open', false);
      panel.setAttribute('inert', '');
      doc.documentElement.style.overflow = previousOverflow;
      for (const el of [doc.querySelector('main'), doc.querySelector('footer')]) {
        el?.removeAttribute('inert');
      }
    }
  };

  doc.addEventListener('click', (event) => {
    const control = (event.target as Element | null)?.closest(`${TOGGLE_SELECTOR}, ${CLOSE_SELECTOR}`);
    if (!control) return;
    if (control.matches(TOGGLE_SELECTOR)) {
      setOpen(true);
    } else {
      setOpen(false);
      getTrigger()?.focus();
    }
  });

  doc.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      setOpen(false);
      getTrigger()?.focus();
    }
  });
}
