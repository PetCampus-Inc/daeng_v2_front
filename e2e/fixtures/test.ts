import { test as base } from '@playwright/test';

import { installAnalyticsBlock } from '../helpers/network';

/**
 * Phase 2 fixture
 * - context 단위 GA/트래킹 차단 (모든 page에 적용)
 */
const test = base.extend({
  context: async ({ context }, use) => {
    await installAnalyticsBlock(context);
    await use(context);
  },
});

export { test };
export { expect } from '@playwright/test';
