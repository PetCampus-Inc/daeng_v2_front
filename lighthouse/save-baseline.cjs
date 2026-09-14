#!/usr/bin/env node
/**
 * 현재 LHCI 결과(.lighthouseci)를 baseline으로 저장.
 * Usage: pnpm lighthouse:baseline
 */
const { aggregateByPage, loadRuns, saveBaseline, BASELINE_PATH } = require('./lib/metrics.cjs');

const pages = aggregateByPage(loadRuns());
if (!pages.length) {
  console.error('No Lighthouse runs found. Run `pnpm lighthouse` first.');
  process.exit(1);
}

const payload = saveBaseline(pages);
console.log(`Saved baseline → ${BASELINE_PATH}`);
console.log(`pages=${payload.pages.length} savedAt=${payload.savedAt}`);
