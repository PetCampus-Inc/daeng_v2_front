import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

import { getE2eEnv } from './helpers/env';
import { GUARDIAN_STORAGE, OWNER_STORAGE } from './helpers/paths';

const { baseURL, apiBaseURL, isCI } = getE2eEnv();

/**
 *  주요 사용자 플로우 E2E
 * - setup: DEV login → owner/guardian storageState
 * - chromium-owner / chromium-guardian: 역할별 재사용
 * - chromium-anon: 비로그인 smoke
 */
export default defineConfig({
  testDir: './flows',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'pnpm --filter knockdog dev',
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
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      testDir: '.',
    },
    {
      name: 'chromium-anon',
      dependencies: ['setup'],
      testMatch: /auth\.smoke\.spec\.ts/,
    },
    {
      name: 'chromium-owner',
      dependencies: ['setup'],
      testMatch: /owner.*\.spec\.ts/,
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
