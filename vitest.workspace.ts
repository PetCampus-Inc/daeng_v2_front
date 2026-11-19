import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const requireFromTestingLibrary = createRequire(require.resolve('@testing-library/react'));
const requireFromRenderer = createRequire(requireFromTestingLibrary.resolve('react-dom'));
const testReact = path.dirname(requireFromRenderer.resolve('react/package.json'));

export default [
  defineConfig({
    esbuild: { jsx: 'automatic' },
    test: {
      name: 'mobile-sentry',
      include: ['./apps/mobile/lib/sentry/*.test.(ts|tsx)', './apps/mobile/bridges/**/*.test.(ts|tsx)'],
      environment: 'node',
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, 'apps/mobile'), react: testReact },
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
        '@views': path.resolve(__dirname, 'apps/knockdog/src/views'),
        '@entities': path.resolve(__dirname, 'apps/knockdog/src/entities'),
        '@features': path.resolve(__dirname, 'apps/knockdog/src/features'),
        react: testReact,
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
