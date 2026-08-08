/**
 * ESLint flat config — TAD §22.3 automated enforcement.
 *
 * Encodes the architectural import rules (TAD §5.1) so the structure is
 * durable, not advisory:
 *   1. shared/ never imports from features/ or content/
 *   2. a feature imports another feature only through its index
 *   3. pages/ contain no business logic and never import content files
 */
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', '.astro-icon/**', 'coverage/**'],
  },

  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },

  {
    extends: [...astro.configs['flat/recommended']],
  },

  // Build tooling (CSP generator, budget gate, …) runs under Node, not in
  // the browser, and reports to stdout by design.
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // Accessibility lint on islands (Preact JSX) — TAD §15.5 authoring layer.
  {
    files: ['**/*.tsx'],
    extends: [jsxA11y.flatConfigs.recommended],
  },

  // Rule 1: shared code must never import from features/ or content/.
  {
    files: ['src/shared/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/**', '**/content/**'],
              message:
                'shared/ must never import from features/ or content/ (TAD §5.1 rule 1).',
            },
          ],
        },
      ],
    },
  },

  // D-023 exception: layouts are the composition root between shared chrome
  // and app concerns (TAD §7.3 places ThemeToggle inside the header). The
  // rule's intent — keeping shared primitives domain-free — is preserved:
  // only layouts may compose feature islands.
  {
    files: ['src/shared/layouts/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/content/**'],
              message: 'Layouts compose features but never import content directly.',
            },
          ],
        },
      ],
    },
  },

  // Rule 2: cross-feature imports only through the feature's index.
  {
    files: ['src/features/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/features/*/**'],
              message:
                'Import other features only through their index.ts, never deep paths (TAD §5.1 rule 2).',
            },
          ],
        },
      ],
    },
  },

  // Rule 3: pages are thin composition — no content-file imports.
  {
    files: ['src/pages/**/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/content/**'],
              message:
                'pages/ compose features and shared code; content access goes through astro:content (TAD §5.1 rule 3).',
            },
          ],
        },
      ],
    },
  },
);
