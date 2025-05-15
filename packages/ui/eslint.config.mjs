import { config } from '@knockdog/eslint-config/react-internal';
import tsParser from '@typescript-eslint/parser';

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
      },
    },
    rules: {
      'no-redeclare': 'off',
    },
  },
];
