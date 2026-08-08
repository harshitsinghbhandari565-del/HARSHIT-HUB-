/**
 * Navigation accessibility (TAD §15.4, D-044). Client-side navigation does
 * not reset focus or announce the page the way a full load does — without
 * help, keyboard and screen-reader users lose their place on every route
 * change. After each `astro:page-load` fired by a navigation, focus moves
 * to the new <h1> (or <main>) and the page title is announced through a
 * polite live region.
 *
 * The initial load is skipped: the browser already announces it, and
 * focus belongs to the user. The announcer is recreated after every swap
 * because the router replaces the whole <body>.
 */
export function initNavA11y(doc: Document): void {
  let firstLoad = true;

  doc.addEventListener('astro:page-load', () => {
    if (firstLoad) {
      firstLoad = false;
      return;
    }

    const target = doc.querySelector('main h1') ?? doc.querySelector('main');
    if (target instanceof HTMLElement) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
    }

    let announcer = doc.getElementById('route-announcer');
    if (!announcer) {
      announcer = doc.createElement('div');
      announcer.id = 'route-announcer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      // Visually hidden without a class dependency — the announcer must
      // render for screen readers but never affect layout (CLS).
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clipPath = 'inset(50%)';
      announcer.style.whiteSpace = 'nowrap';
      doc.body.appendChild(announcer);
    }
    announcer.textContent = doc.title;
  });
}
