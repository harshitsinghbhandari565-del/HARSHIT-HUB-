/**
 * MobileMenu island (Dev Plan T-C2) — hamburger trigger + slide-in panel
 * for <768px (hydrated via client:media, so desktop never downloads it).
 *
 * Accessibility contract (Design §25.2, Gate 2):
 * - trigger carries aria-expanded/aria-controls
 * - opening moves focus into the panel; closing returns it to the trigger
 * - focus is trapped while open; Escape closes
 * - the rest of the page receives `inert` while the menu is open
 * - body scroll is locked while open
 *
 * Without JS the trigger is hidden (CSS) and Header's static nav stays
 * visible on mobile — invariant I1.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

import { createFocusTrap, type FocusTrap } from '../lib/focusTrap';
import styles from './MobileMenu.module.css';

export interface MobileMenuProps {
  links: ReadonlyArray<{ label: string; href: string }>;
  currentPage?: string;
}

function MenuIcon() {
  return (
    <svg
      class={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M4 5h16M4 12h16M4 19h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      class={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default function MobileMenu({ links, currentPage = '/' }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);
  const previousOverflow = useRef<string>('');

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (open) {
      trapRef.current = createFocusTrap(panel);
      trapRef.current.activate();
      panel.addEventListener('keydown', onEscape);
      previousOverflow.current = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      for (const el of [document.querySelector('main'), document.querySelector('footer')]) {
        el?.setAttribute('inert', '');
      }
      closeRef.current?.focus();
    } else {
      trapRef.current?.deactivate();
      trapRef.current = null;
      panel.removeEventListener('keydown', onEscape);
      document.documentElement.style.overflow = previousOverflow.current;
      for (const el of [document.querySelector('main'), document.querySelector('footer')]) {
        el?.removeAttribute('inert');
      }
    }
  }, [open]);

  useEffect(() => () => trapRef.current?.deactivate(), []);

  const openMenu = () => setOpen(true);

  const closeMenu = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div class={styles.wrapper}>
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        data-menu-toggle
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label="Open menu"
        onClick={openMenu}
      >
        <MenuIcon />
      </button>

      <div
        ref={panelRef}
        id="mobile-menu-panel"
        class={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open || undefined}
      >
        <div class={styles.panelHeader}>
          <span class={styles.brand} aria-hidden="true">
            Harshit<span class={styles.brandDot}>.</span>
          </span>
          <button
            ref={closeRef}
            type="button"
            class={styles.closeButton}
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <CloseIcon />
          </button>
        </div>
        <nav class={styles.nav} aria-label="Mobile">
          <ul class={styles.linkList}>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  class={styles.link}
                  href={link.href}
                  aria-current={link.href === currentPage ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
