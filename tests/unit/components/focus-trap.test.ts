/**
 * Focus trap — DOM behaviour tests using jsdom as a library (node
 * environment; vitest's jsdom environment breaks the transform pipeline,
 * D-018).
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFocusTrap, getFocusableElements } from '../../../src/shared/lib/focusTrap';

let dom: JSDOM;
let panel: HTMLElement;
let first: HTMLButtonElement;
let middle: HTMLAnchorElement;
let last: HTMLButtonElement;

function pressTab(target: HTMLElement, shiftKey = false) {
  const event = new dom.window.KeyboardEvent('keydown', {
    key: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body>
    <div id="panel">
      <button id="first">first</button>
      <a id="middle" href="/x">middle</a>
      <button id="last">last</button>
    </div>
    <button id="outside">outside</button>
  </body></html>`);
  const g = globalThis as unknown as { document?: unknown };
  g.document = dom.window.document;
  panel = dom.window.document.getElementById('panel') as HTMLElement;
  first = dom.window.document.getElementById('first') as HTMLButtonElement;
  middle = dom.window.document.getElementById('middle') as HTMLAnchorElement;
  last = dom.window.document.getElementById('last') as HTMLButtonElement;
});

afterEach(() => {
  const g = globalThis as unknown as { document?: unknown };
  g.document = undefined;
  dom.window.close();
});

describe('getFocusableElements', () => {
  it('finds interactive descendants and excludes hidden/aria-hidden ones', () => {
    expect(getFocusableElements(panel)).toEqual([first, middle, last]);
    middle.setAttribute('aria-hidden', 'true');
    expect(getFocusableElements(panel)).toEqual([first, last]);
  });
});

describe('createFocusTrap', () => {
  it('wraps Tab from the last element back to the first', () => {
    const trap = createFocusTrap(panel);
    trap.activate();
    last.focus();
    const event = pressTab(last);
    expect(event.defaultPrevented).toBe(true);
    expect(dom.window.document.activeElement).toBe(first);
    trap.deactivate();
  });

  it('wraps Shift+Tab from the first element to the last', () => {
    const trap = createFocusTrap(panel);
    trap.activate();
    first.focus();
    const event = pressTab(first, true);
    expect(event.defaultPrevented).toBe(true);
    expect(dom.window.document.activeElement).toBe(last);
    trap.deactivate();
  });

  it('pulls stray focus (outside the container) back inside', () => {
    const trap = createFocusTrap(panel);
    trap.activate();
    const outside = dom.window.document.getElementById('outside') as HTMLButtonElement;
    outside.focus();
    const event = pressTab(outside);
    expect(event.defaultPrevented).toBe(true);
    expect(dom.window.document.activeElement).toBe(first);
    trap.deactivate();
  });

  it('stops intercepting after deactivate', () => {
    const trap = createFocusTrap(panel);
    trap.activate();
    trap.deactivate();
    last.focus();
    const event = pressTab(last);
    expect(event.defaultPrevented).toBe(false);
  });
});
