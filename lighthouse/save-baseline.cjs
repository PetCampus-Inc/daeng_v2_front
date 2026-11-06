#!/usr/bin/env node
/**
 * 현재 LHCI 결과(.lighthouseci)를 baseline으로 저장.
 * PAGE_LABELS 전 경로에 유효(non-redirect) run이 정확히 3개일 때만 저장.
 * Usage: pnpm lighthouse:baseline
 */
const {
  aggregateByPage,
  loadRuns,
  saveBaseline,
  assessCompleteness,
  formatCompletenessIssues,
  BASELINE_PATH,
  REQUIRED_RUNS,
} = require('./lib/metrics.cjs');

const pages = aggregateByPage(loadRuns());
if (!pages.length) {
  console.error('No Lighthouse runs found. Run `pnpm lighthouse` first.');
  process.exit(1);
}

const completeness = assessCompleteness(pages);
if (!completeness.complete) {
  console.error(`Cannot save baseline — need exactly ${REQUIRED_RUNS} valid runs per PAGE_LABELS path.`);
  for (const line of formatCompletenessIssues(completeness)) {
    console.error(`  - ${line}`);
  }
  process.exit(1);
}

try {
  const payload = saveBaseline(pages);
  console.log(`Saved baseline → ${BASELINE_PATH}`);
  console.log(`pages=${payload.pages.length} savedAt=${payload.savedAt}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
