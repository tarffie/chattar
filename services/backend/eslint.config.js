import js from "@eslint/js";
import tseslint from 'typescript-eslint';
import parser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: '../../tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error"
    },
  },
]);
