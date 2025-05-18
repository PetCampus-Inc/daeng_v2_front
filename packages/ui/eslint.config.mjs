import { defineConfig } from 'eslint/config';
import { config } from '@knockdog/eslint-config/react-internal';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("eslint").Linter.Config} */
export default defineConfig([
  ...config,
  {
    ignores: ['**/*.config.js', '**/*.config.mjs'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'svg.d.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      'no-redeclare': 'off',
    },
  },
]);
