import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

import { getE2eEnv } from './helpers/env';
import { GUARDIAN_STORAGE, OWNER_STORAGE } from './helpers/paths';

const { baseURL, apiBaseURL, isCI } = getE2eEnv();

/** CI 워크플로가 이미 서버를 띄운 경우 webServer 스킵 */
const skipWebServer = process.env.E2E_SKIP_WEBSERVER === '1';

/**
 * 주요 사용자 플로우 E2E
 * - setup: DEV login → owner/guardian storageState
 * - chromium-owner / chromium-guardian: 역할별 재사용
 * - chromium-anon: 비로그인 smoke + GA block
 */
export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['github'],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
      ],
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  ...(skipWebServer
    ? {}
    : {
        webServer: {
          command: isCI ? 'pnpm --filter knockdog start' : 'pnpm --filter knockdog dev',
          url: baseURL,
          reuseExistingServer: !isCI,
          timeout: 180_000,
          cwd: path.join(__dirname, '..'),
          env: {
            ...process.env,
            NEXT_PUBLIC_API_BASE_URL: apiBaseURL,
            NEXT_PUBLIC_WEB_URL: baseURL,
          },
        },
      }),
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: '.',
    },
    {
      name: 'chromium-anon',
      dependencies: ['setup'],
      testMatch: /(auth\.smoke|analytics-block)\.spec\.ts/,
    },
    {
      name: 'chromium-owner',
      dependencies: ['setup'],
      testMatch: /(owner|mypage).*\.spec\.ts/,
      use: { storageState: OWNER_STORAGE },
    },
    {
      name: 'chromium-guardian',
      dependencies: ['setup'],
      testMatch: /guardian.*\.spec\.ts/,
      use: { storageState: GUARDIAN_STORAGE },
    },
  ],
});
