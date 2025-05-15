import { config } from '@knockdog/eslint-config/react-internal';
import { defineConfig } from 'eslint/config';
import tsParser from '@typescript-eslint/parser';
import storybook from 'eslint-plugin-storybook';

export default defineConfig([
  ...config,
  ...storybook.configs['flat/recommended'],
  {
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        project: true,
      },
    },
  },
]);
