import { defineConfig, globalIgnores } from 'eslint/config';
import { nextJsConfig } from '@knockdog/eslint-config/next-js';

export default defineConfig([
  ...nextJsConfig,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
