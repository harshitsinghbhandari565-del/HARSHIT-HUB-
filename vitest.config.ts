import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    // CI stays green during phases where no unit tests exist yet.
    passWithNoTests: true,
  },
});
