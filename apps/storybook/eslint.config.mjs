import { config } from '@knockdog/eslint-config/react-internal';

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
