import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default [
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
    esbuild: { jsx: 'automatic' },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'apps/knockdog/src/app'),
        '@views': path.resolve(__dirname, 'apps/knockdog/src/views'),
        '@widgets': path.resolve(__dirname, 'apps/knockdog/src/widgets'),
        '@features': path.resolve(__dirname, 'apps/knockdog/src/features'),
        '@entities': path.resolve(__dirname, 'apps/knockdog/src/entities'),
        '@shared': path.resolve(__dirname, 'apps/knockdog/src/shared'),
        '@stores': path.resolve(__dirname, 'apps/knockdog/src/shared/store'),
        '@utils': path.resolve(__dirname, 'apps/knockdog/src/shared/utils'),
        '@providers': path.resolve(__dirname, 'apps/knockdog/src/app/providers'),
        '@constants': path.resolve(__dirname, 'apps/knockdog/src/shared/constants'),
        '@type': path.resolve(__dirname, 'apps/knockdog/src/shared/types'),
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
