import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default [
  defineConfig({
    test: {
      name: 'mobile-sentry',
      include: ['./apps/mobile/lib/sentry/*.test.ts'],
      environment: 'node',
    },
  }),
  defineConfig({
    test: {
      name: 'knockdog',
      include: ['./apps/knockdog/**/*.test.(ts|tsx)'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
      ],
      environment: 'node',
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, 'apps/knockdog/src/shared'),
      },
    },
  }),
  defineConfig({
    test: {
      name: 'headless-ui',
      include: ['./packages/headless-ui/**/*.test.(ts|tsx)'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
      ],
      environment: 'jsdom',
    },
  }),
];
