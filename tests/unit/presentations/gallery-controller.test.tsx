/**
 * GalleryController island (T-D4) — interactive tests in jsdom: sort
 * reorders the pre-rendered DOM, subject filter hides cards, URL sync
 * (pushState for sort, replaceState for filter), and initial URL state.
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import GalleryController from '../../../src/features/presentations/islands/GalleryController';

let dom: JSDOM;
let host: HTMLElement;

function galleryDom(search = '') {
  return new JSDOM(
    `<!doctype html><html><body>
       <main id="main-content"></main>
       <div id="host"></div>
     </body></html>`,
    { url: `https://example.test/presentations${search}`, pretendToBeVisual: true },
  );
}

/** Serialized card markup — Astro passes island slots as HTML, so the
 * test emulates that with dangerouslySetInnerHTML below. */
function makeCardsHtml() {
  const rows = [
    { subject: 'Science', date: '2026-08-01T00:00:00.000Z', title: 'Biology Talk' },
    { subject: 'History', date: '2026-07-24T00:00:00.000Z', title: 'Revolution Talk' },
    { subject: 'Science', date: '2026-07-10T00:00:00.000Z', title: 'Ecology Talk' },
  ];
  const items = rows
    .map(
      (r) =>
        `<li data-subject="${r.subject}" data-date="${r.date}" data-title="${r.title}">${r.title}</li>`,
    )
    .join('');
  return `<ul data-gallery>${items}</ul>`;
}

/** Astro-like slot children: serialized markup, rendered as HTML. */
function cardSlot() {
  return <div dangerouslySetInnerHTML={{ __html: makeCardsHtml() }} />;
}

function setGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.localStorage = dom.window.localStorage;
}

function clearGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.localStorage;
}

async function waitFor(condition: () => boolean, what: string, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function orderedTitles(): string[] {
  const doc = dom.window.document;
  return Array.from(doc.querySelectorAll<HTMLElement>('ul[data-gallery] > li')).map(
    (li) => li.dataset.title ?? '',
  );
}

beforeEach(() => {
  dom = galleryDom();
  setGlobals();
  host = dom.window.document.getElementById('host') as HTMLElement;
});

afterEach(() => {
  preactRender(null, host);
  clearGlobals();
  dom.window.close();
});

describe('GalleryController island', () => {
  it('renders All + subject chips and the four sort options', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>{cardSlot()}</GalleryController>,
      host,
    );
    await waitFor(() => host.textContent.includes('Most Recent'), 'controls render');
    const doc = dom.window.document;
    expect(host.textContent).toContain('All');
    expect(host.textContent).toContain('Science');
    expect(host.textContent).toContain('History');
    const options = Array.from(doc.querySelectorAll('#gallery-sort option')).map((o) =>
      o.textContent?.trim(),
    );
    expect(options).toEqual(['Most Recent', 'Oldest First', 'Subject A–Z', 'Subject Z–A']);
  });

  it('sorts the pre-rendered cards and pushStates the URL', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>{cardSlot()}</GalleryController>,
      host,
    );
    await waitFor(() => orderedTitles()[0] === 'Biology Talk', 'initial date-desc order');

    const select = dom.window.document.querySelector('#gallery-sort') as HTMLSelectElement;
    select.value = 'date-asc';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    await waitFor(() => orderedTitles()[0] === 'Ecology Talk', 'date-asc reorder');
    expect(orderedTitles()).toEqual(['Ecology Talk', 'Revolution Talk', 'Biology Talk']);
    expect(dom.window.location.search).toBe('?sort=date-asc');

    select.value = 'subject-asc';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    await waitFor(() => orderedTitles()[0] === 'Revolution Talk', 'subject-asc reorder');
    expect(orderedTitles()).toEqual(['Revolution Talk', 'Biology Talk', 'Ecology Talk']);
  });

  it('filters by subject with replaceState and a live status', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>{cardSlot()}</GalleryController>,
      host,
    );
    await waitFor(() => orderedTitles()[0] === 'Biology Talk', 'initial render');

    const scienceChip = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent === 'Science',
    ) as HTMLButtonElement;
    scienceChip.click();
    await waitFor(
      () =>
        dom.window.document.querySelector('li[data-title="Revolution Talk"]')?.hasAttribute('hidden') ??
        false,
      'history card hidden',
    );
    const visible = Array.from(
      dom.window.document.querySelectorAll<HTMLElement>('ul[data-gallery] > li:not([hidden])'),
    ).map((li) => li.dataset.title);
    expect(visible).toEqual(['Biology Talk', 'Ecology Talk']);
    expect(dom.window.location.search).toBe('?subject=Science');
    expect(host.textContent).toContain('2 of 3 presentations shown');

    // "All" resets the filter.
    const allChip = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent === 'All',
    ) as HTMLButtonElement;
    allChip.click();
    await waitFor(
      () =>
        !(
          dom.window.document
            .querySelector('li[data-title="Revolution Talk"]')
            ?.hasAttribute('hidden') ?? true
        ),
      'filter reset',
    );
    expect(dom.window.location.search).toBe('');
  });

  it('applies URL params present at hydration', async () => {
    dom.window.close();
    dom = galleryDom('?sort=date-asc&subject=Science');
    setGlobals();
    host = dom.window.document.getElementById('host') as HTMLElement;
    preactRender(
      <GalleryController subjects={['Science', 'History']}>{cardSlot()}</GalleryController>,
      host,
    );
    await waitFor(() => orderedTitles().length === 3, 'cards mounted');
    await waitFor(
      () =>
        dom.window.document.querySelector('li[data-title="Revolution Talk"]')?.hasAttribute('hidden') ??
        false,
      'URL filter applied',
    );
    // date-asc among Science cards: Ecology (07-10) before Biology (08-01).
    const visible = Array.from(
      dom.window.document.querySelectorAll<HTMLElement>('ul[data-gallery] > li:not([hidden])'),
    ).map((li) => li.dataset.title);
    expect(visible).toEqual(['Ecology Talk', 'Biology Talk']);
  });
});
