// apps/backend/eslint.config.js
import { defineConfig } from 'eslint/config';
import rootConfig from '../../eslint.config.js';

// Just extend root, no need for additional config unless overriding
export default defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
