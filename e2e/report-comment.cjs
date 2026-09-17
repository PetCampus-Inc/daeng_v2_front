#!/usr/bin/env node
/**
 * Playwright JSON 결과 → PR 코멘트 마크다운
 *
 * 입력: e2e/test-results/results.json (없으면 안내 문구만)
 * env:
 *   E2E_OUTCOME  — workflow step outcome (success|failure|…)
 *   RUN_URL
 *   ARTIFACT_NAME
 *   PR_NUMBER
 */
const fs = require('node:fs');
const path = require('node:path');

const COMMENT_MARKER = '<!-- playwright-e2e-report -->';
const RESULTS_PATH = path.join(__dirname, 'test-results', 'results.json');

function statusEmoji(status) {
  if (status === 'passed' || status === 'expected') return '✅';
  if (status === 'skipped') return '⏭️';
  if (status === 'flaky') return '⚠️';
  return '❌';
}

function statusLabel(status) {
  if (status === 'passed' || status === 'expected') return 'PASS';
  if (status === 'skipped') return 'SKIP';
  if (status === 'flaky') return 'FLAKY';
  if (status === 'timedOut') return 'TIMEOUT';
  return 'FAIL';
}

/** 최종 결과: retry 있으면 마지막 result, 중간에 passed면 passed */
function resolveTestStatus(test) {
  const results = test.results ?? [];
  if (!results.length) return test.status ?? 'failed';

  if (results.some((r) => r.status === 'passed')) {
    return results.length > 1 ? 'flaky' : 'passed';
  }

  const last = results[results.length - 1];
  return last?.status ?? 'failed';
}

function looksLikeFile(segment) {
  return /\.(ts|js|tsx|jsx)$/.test(segment) || segment.includes('/') || segment.includes('\\');
}

function collectRows(suite, rows = [], ancestors = []) {
  const titlePath = suite.title && !looksLikeFile(suite.title) ? [...ancestors, suite.title] : ancestors;

  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const status = resolveTestStatus(test);
      const parts = [...titlePath, spec.title].filter((part) => part && !looksLikeFile(part));
      rows.push({
        project: test.projectName ?? '—',
        name: parts.join(' › ') || spec.title || 'unnamed',
        status,
      });
    }
  }

  for (const child of suite.suites ?? []) {
    collectRows(child, rows, titlePath);
  }

  return rows;
}

function loadRows() {
  if (!fs.existsSync(RESULTS_PATH)) return null;

  try {
    const report = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
    const rows = [];
    for (const suite of report.suites ?? []) {
      collectRows(suite, rows);
    }
    return rows;
  } catch (error) {
    console.error('[e2e/report-comment] failed to parse results.json', error);
    return null;
  }
}

function buildMarkdown() {
  const outcome = process.env.E2E_OUTCOME ?? 'unknown';
  const runUrl = process.env.RUN_URL ?? '#';
  const artifactName = process.env.ARTIFACT_NAME ?? 'playwright-report';
  const overallPass = outcome === 'success';
  const rows = loadRows();

  const passed = rows?.filter((r) => r.status === 'passed' || r.status === 'flaky').length ?? 0;
  const failed =
    rows?.filter((r) => r.status !== 'passed' && r.status !== 'flaky' && r.status !== 'skipped').length ?? 0;
  const skipped = rows?.filter((r) => r.status === 'skipped').length ?? 0;
  const total = rows?.length ?? 0;

  const lines = [
    COMMENT_MARKER,
    '## Playwright E2E',
    '',
    '_non-blocking · PR opened/reopened 시 1회 · 푸시마다 재실행 안 함_',
    '',
    '| | |',
    '| --- | --- |',
    `| **Result** | ${overallPass ? '✅' : '❌'} **${overallPass ? 'PASS' : 'FAIL'}** \`${outcome}\` |`,
  ];

  if (rows) {
    lines.push(`| **Summary** | ${passed} passed · ${failed} failed · ${skipped} skipped / ${total} |`);
  }

  lines.push(`| **Run** | [workflow](${runUrl}) |`);
  lines.push(`| **Artifact** | \`${artifactName}\` |`);
  lines.push('');

  if (rows?.length) {
    lines.push('### Results');
    lines.push('');
    lines.push('| Spec | Project | Status |');
    lines.push('| --- | --- | --- |');

    // 실패 먼저
    const ordered = [
      ...rows.filter((r) => r.status !== 'passed' && r.status !== 'skipped' && r.status !== 'flaky'),
      ...rows.filter((r) => r.status === 'flaky'),
      ...rows.filter((r) => r.status === 'passed'),
      ...rows.filter((r) => r.status === 'skipped'),
    ];

    for (const row of ordered) {
      const safeName = row.name.replace(/\|/g, '\\|');
      lines.push(
        `| ${safeName} | \`${row.project}\` | ${statusEmoji(row.status)} ${statusLabel(row.status)} |`
      );
    }
    lines.push('');
  } else {
    lines.push('### Results');
    lines.push('');
    lines.push('_`results.json` 없음 — Artifact / workflow 로그에서 확인_');
    lines.push('');
  }

  lines.push('### Failure debugging');
  lines.push('');
  lines.push(`1. [workflow run](${runUrl}) 로그에서 실패 Step 확인`);
  lines.push(`2. Artifact \`${artifactName}\` 다운로드`);
  lines.push('3. Trace / Screenshot / Video / Network 로 FE · BE · Contract · Test 범위 좁히기');
  lines.push('');
  lines.push('> Required check 아님 — 실패해도 merge 가능');
  lines.push('');

  return lines.join('\n');
}

process.stdout.write(buildMarkdown());
