import { defineConfig } from 'vitest/config';

export default [
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
