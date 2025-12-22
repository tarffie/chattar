import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.js';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

export default defineConfig([
  ...rootConfig,
  {
    "languageOptions": {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      eslintPluginPrettierRecommended
    ],
    files: ['**/*.ts'],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error"
    },
  },
]);
