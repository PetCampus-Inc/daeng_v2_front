import { config } from '@knockdog/eslint-config/react-internal';
import tsParser from '@typescript-eslint/parser';

export default [
  ...config,
  {
    languageOptions: {
      parser: tsParser,

      parserOptions: {
        project: true,
      },
    },
  },
];
