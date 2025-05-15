import { nextJsConfig } from '@knockdog/eslint-config/next-js';
import tsParser from '@typescript-eslint/parser';

export default [
  ...nextJsConfig,
  {
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        project: true,
      },
    },
  },
];
