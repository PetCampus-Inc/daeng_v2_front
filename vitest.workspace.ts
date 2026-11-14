import path from 'node:path';
import { defineConfig } from 'vitest/config';

/** headless-ui 패키지는 dist로 빌드돼야 불러올 수 있어서, 테스트에서는 소스를 직접 가리킨다 */
const headlessUiAliases = Object.fromEntries(
  [
    ['@daeng-design/react-checkbox', 'checkbox/src/index.ts'],
    ['@daeng-design/react-portal', 'portal/src/index.ts'],
    ['@daeng-design/react-progress', 'progress/src/index.ts'],
    ['@daeng-design/react-segmented-control', 'segmented-control/src/index.ts'],
    ['@daeng-design/react-swiper', 'swiper/src/index.ts'],
    ['@daeng-design/react-text-field', 'text-field/src/index.ts'],
    ['@daeng-design/react-textarea', 'textarea/src/index.ts'],
    ['@daeng-design/react-toggle', 'toggle/src/index.ts'],
    ['@daeng-design/react-tooltip', 'tooltip/src/index.ts'],
    ['@daeng-design/utils', 'utils/src/index.ts'],
    ['@daeng-design/vaul', 'vaul/src/index.tsx'],
  ].map(([name, file]) => [name, path.resolve(__dirname, 'packages/headless-ui', file)])
);

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
      env: { NEXT_PUBLIC_API_BASE_URL: 'http://localhost:3000/api' },
    },
    esbuild: { jsx: 'automatic' },
    resolve: {
      alias: {
        '@app': path.resolve(__dirname, 'apps/knockdog/src/app'),
        '@shared': path.resolve(__dirname, 'apps/knockdog/src/shared'),
        '@entities': path.resolve(__dirname, 'apps/knockdog/src/entities'),
        '@features': path.resolve(__dirname, 'apps/knockdog/src/features'),
        '@views': path.resolve(__dirname, 'apps/knockdog/src/views'),
        '@widgets': path.resolve(__dirname, 'apps/knockdog/src/widgets'),
        '@stores': path.resolve(__dirname, 'apps/knockdog/src/shared/store'),
        '@utils': path.resolve(__dirname, 'apps/knockdog/src/shared/utils'),
        '@providers': path.resolve(__dirname, 'apps/knockdog/src/app/providers'),
        '@constants': path.resolve(__dirname, 'apps/knockdog/src/shared/constants'),
        '@type': path.resolve(__dirname, 'apps/knockdog/src/shared/types'),
        ...headlessUiAliases,
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
  defineConfig({
    test: {
      name: 'mobile',
      include: ['./apps/mobile/bridges/handlers/*.test.ts', './apps/mobile/components/*.test.tsx'],
      environment: 'node',
    },
    esbuild: { jsx: 'automatic' },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'apps/mobile'),
        react: path.resolve(__dirname, 'apps/knockdog/node_modules/react'),
      },
    },
  }),
];
