import { config } from '@knockdog/eslint-config/react-internal';
import { defineConfig } from 'eslint/config';
import storybook from 'eslint-plugin-storybook';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import("eslint").Linter.Config} */
export default defineConfig([
  ...config,
  ...storybook.configs['flat/recommended'],
  {
    ignores: ['**/*.config.js', '**/*.config.mjs'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'svg.d.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
