import nextConfig from '@knockdog/eslint-config/next-js';
import tsParser from '@typescript-eslint/parser';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsconfigPath = path.resolve(__dirname, 'tsconfig.json');

export default [
  nextConfig,

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: [tsconfigPath],
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    files: ['eslint.config.*', '*.config.*'],
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
  },
];
