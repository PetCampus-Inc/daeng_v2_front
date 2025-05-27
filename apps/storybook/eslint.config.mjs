import { config } from '@knockdog/eslint-config/react-internal';
import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import storybook from 'eslint-plugin-storybook';

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
      parser: tsParser,
      parserOptions: {
        projectService: true,
      },
    },
  },
]);
