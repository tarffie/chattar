// eslint.config.js (root)
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  // Global settings for all TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/tests/**', '**/__tests/**', '.config/', 'dist/', '**/tsconfig.json'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // Start with recommended rules
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,

      // Your custom rules
      'no-unused-vars': 'off', // Turn off JS rule
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          endOfLine: 'auto',
          tabWidth: 2,
          quoteProps: 'consistent',
        },
      ],
      semi: 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'max-len': ['error', { code: 80, tabWidth: 4 }],
    },
  },
  // Add prettier last
  eslintPluginPrettierRecommended,
]);
