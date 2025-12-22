import { defineConfig } from "eslint/config";
import tseslint from 'typescript-eslint';
import js from '@eslint/js';
import "@typescript-eslint/eslint-plugin";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended"

export default defineConfig([
  {
    files: [["**/src/*", "**/*.ts"]],
    ignores: ["**/tests/**", "**/__tests/**", ".config/", "dist/", "tsconfig.json"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      eslintPluginPrettierRecommended
    ],
    plugins: { js, tseslint, eslintPluginPrettierRecommended },
    "languageOptions": {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "prettier/prettier": ["error", {
        "singleQuote": true,
        "endOfLine": "auto",
        "tabWidth": 2,
        "quoteProps": "consistent"
      }],
      "no-unused-vars": "off",
      semi: 'error',
      "no-unused-expressions": "error",
      "prefer-const": "error",
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
]);
