/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

/**
 * getViteConfig wraps the project's Astro config so Vitest can compile
 * .astro components and resolve integrations (astro-icon) — required for
 * the Phase B component suite (T-B4) via the astro/container API.
 */
export default getViteConfig({
  test: {
    environment: 'node',
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/a11y/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
    ],
    // CI stays green during phases where no unit tests exist yet.
    passWithNoTests: true,
  },
});
