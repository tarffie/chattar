import { defineConfig } from "eslint/config";
import "@typescript-eslint/eslint-plugin";
export default defineConfig([
  {
    rules: {
      semi: 'error',
      "prefer-const": "error",
    },
  },
  {
    files: [["**/src/*", "**/*.ts"]],
    ignores: ["__tests/**", ".config/", "dist/", "tsconfig.json"],
  }
]);
