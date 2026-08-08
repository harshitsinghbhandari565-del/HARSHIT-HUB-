/**
 * Theme utilities — pure logic unit tests (no DOM): storage discipline,
 * panel-lock decision, and the FOUC guard's initial-theme rule.
 */
import { describe, expect, it } from 'vitest';

import {
  PANEL_QUERY,
  applyTheme,
  getStoredTheme,
  initialTheme,
  isPanelLocked,
  storeTheme,
} from '../../../src/features/theme/lib/theme';

/** Minimal Storage stub. */
function makeStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
}

function makeMatchMedia(matches: boolean) {
  return (query: string) =>
    ({
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

describe('getStoredTheme', () => {
  it('returns stored light/dark values', () => {
    expect(getStoredTheme(makeStorage({ theme: 'dark' }))).toBe('dark');
    expect(getStoredTheme(makeStorage({ theme: 'light' }))).toBe('light');
  });

  it('returns null for missing, foreign, or blocked storage', () => {
    expect(getStoredTheme(makeStorage())).toBeNull();
    expect(getStoredTheme(makeStorage({ theme: 'purple' }))).toBeNull();
    expect(getStoredTheme(undefined)).toBeNull();
    const throwing = {
      ...makeStorage(),
      getItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    expect(getStoredTheme(throwing)).toBeNull();
  });
});

describe('storeTheme', () => {
  it('persists the choice and survives blocked storage', () => {
    const storage = makeStorage();
    storeTheme('dark', storage);
    expect(storage.getItem('theme')).toBe('dark');
    const throwing = {
      ...makeStorage(),
      setItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    expect(() => storeTheme('dark', throwing)).not.toThrow();
  });
});

describe('isPanelLocked', () => {
  it('reflects the ADR-0011 media query result', () => {
    expect(isPanelLocked(makeMatchMedia(true))).toBe(true);
    expect(isPanelLocked(makeMatchMedia(false))).toBe(false);
    expect(isPanelLocked(() => {
      throw new Error('no matchMedia');
    })).toBe(false);
  });

  it('queries the exact ADR-0011 condition', () => {
    let asked = '';
    isPanelLocked((q) => {
      asked = q;
      return { matches: false } as MediaQueryList;
    });
    expect(asked).toBe(PANEL_QUERY);
    expect(PANEL_QUERY).toContain('min-width: 1920px');
    expect(PANEL_QUERY).toContain('pointer: coarse');
    expect(PANEL_QUERY).toContain('hover: none');
  });
});

describe('initialTheme (FOUC guard decision)', () => {
  it('defaults to light', () => {
    expect(initialTheme(null, false)).toBe('light');
  });

  it('honours a stored dark preference off-panel', () => {
    expect(initialTheme('dark', false)).toBe('dark');
  });

  it('forces light on panels even with a stored dark preference', () => {
    expect(initialTheme('dark', true)).toBe('light');
  });
});

describe('applyTheme', () => {
  it('sets data-theme on the given root', () => {
    const root = { dataset: {} } as unknown as HTMLElement;
    applyTheme('dark', root);
    expect(root.dataset.theme).toBe('dark');
    applyTheme('light', root);
    expect(root.dataset.theme).toBe('light');
  });
});
