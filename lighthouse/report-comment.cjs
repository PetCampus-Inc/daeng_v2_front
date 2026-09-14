#!/usr/bin/env node
/**
 * 최신 LHCI 결과 + baseline 비교 → PR 코멘트 마크다운 (stdout)
 *
 * PR Overall = Regression (baseline 대비)
 * Absolute Health = Web Vitals 참고용
 */
const {
  COMMENT_MARKER,
  loadRuns,
  aggregateByPage,
  loadBaseline,
  attachRegression,
  worstRegressionKey,
  formatMs,
  formatMsRaw,
  formatPct,
  REGRESSION,
} = require('./lib/metrics.cjs');

function buildMarkdown(pages, baseline) {
  const hasBaseline = Boolean(baseline?.pages?.length);
  const lines = [
    COMMENT_MARKER,
    '## Lighthouse Performance Summary',
    '',
    hasBaseline
      ? `_non-blocking · PR Overall = **Regression** · Absolute = 참고 · baseline \`${baseline.savedAt}\`_`
      : '_non-blocking · baseline 없음 → Regression 생략 · Absolute만 표시_',
    '',
  ];

  if (!pages.length) {
    lines.push('⚠️ 리포트 JSON이 없습니다. collect 단계를 확인하세요.');
    lines.push('');
    return lines.join('\n');
  }

  for (const page of pages) {
    lines.push(`### ${page.label}`);
    lines.push('');
    lines.push(`\`${page.pathname}\` · median of ${page.runs} run(s)`);
    if (page.redirected) {
      lines.push('');
      lines.push('> ⚠️ 최종 URL이 요청 path와 다릅니다 (로그인 리다이렉트 등).');
    }
    lines.push('');

    if (page.regressions) {
      lines.push('| Metric | Value | Absolute | Baseline | Change | Regression |');
      lines.push('| --- | --- | --- | --- | --- | --- |');
      lines.push(
        `| LCP | ${formatMs(page.lcp)} | ${page.lcpGrade.emoji} ${page.lcpGrade.label} | ${formatMs(page.regressions.lcp.baseline)} | ${formatPct(page.regressions.lcp.ratio)} | ${page.regressions.lcp.grade.emoji} ${page.regressions.lcp.grade.label} |`
      );
      lines.push(
        `| TBT | ${formatMsRaw(page.tbt)} | ${page.tbtGrade.emoji} ${page.tbtGrade.label} | ${formatMsRaw(page.regressions.tbt.baseline)} | ${formatPct(page.regressions.tbt.ratio)} | ${page.regressions.tbt.grade.emoji} ${page.regressions.tbt.grade.label} |`
      );
      lines.push(
        `| CLS | ${page.cls == null ? '—' : page.cls.toFixed(3)} | ${page.clsGrade.emoji} ${page.clsGrade.label} | ${page.regressions.cls.baseline == null ? '—' : page.regressions.cls.baseline.toFixed(3)} | ${formatPct(page.regressions.cls.ratio)} | ${page.regressions.cls.grade.emoji} ${page.regressions.cls.grade.label} |`
      );
      lines.push(
        `| Performance | ${page.performance ?? '—'} | — | ${page.regressions.performance.baseline ?? '—'} | ${formatPct(page.regressions.performance.ratio)} | ${page.regressions.performance.grade.emoji} ${page.regressions.performance.grade.label} |`
      );
      lines.push(`| FCP | ${formatMs(page.fcp)} | — | ${formatMs(page.baseline?.fcp)} | — | — |`);
    } else {
      lines.push('| Metric | Value | Absolute |');
      lines.push('| --- | --- | --- |');
      lines.push(`| LCP | ${formatMs(page.lcp)} | ${page.lcpGrade.emoji} ${page.lcpGrade.label} |`);
      lines.push(`| TBT | ${formatMsRaw(page.tbt)} | ${page.tbtGrade.emoji} ${page.tbtGrade.label} |`);
      lines.push(
        `| CLS | ${page.cls == null ? '—' : page.cls.toFixed(3)} | ${page.clsGrade.emoji} ${page.clsGrade.label} |`
      );
      lines.push(`| Performance | ${page.performance ?? '—'} | — |`);
      lines.push(`| FCP | ${formatMs(page.fcp)} | — |`);
    }

    lines.push('');
  }

  const hasPoor = pages.some(
    (p) => p.lcpGrade.label === 'Poor' || p.tbtGrade.label === 'Poor' || p.clsGrade.label === 'Poor'
  );
  const hasNi = pages.some(
    (p) => p.lcpGrade.label === 'NI' || p.tbtGrade.label === 'NI' || p.clsGrade.label === 'NI'
  );

  let absoluteEmoji = '🟢';
  let absoluteLabel = 'GOOD';
  if (hasPoor) {
    absoluteEmoji = '🔴';
    absoluteLabel = 'BAD';
  } else if (hasNi) {
    absoluteEmoji = '🟡';
    absoluteLabel = 'WARN';
  }

  lines.push('---');
  lines.push('');
  lines.push(`**Absolute Health (참고):** ${absoluteEmoji} ${absoluteLabel}`);
  lines.push('');

  if (!hasBaseline) {
    lines.push('**Regression Overall:** — (baseline 없음 · `pnpm lighthouse:baseline`으로 저장)');
    lines.push('');
    return lines.join('\n');
  }

  const { worst, reason } = worstRegressionKey(pages);
  const regressionMap = {
    none: { emoji: '⚪', label: 'N/A' },
    good: { emoji: '🟢', label: 'GOOD' },
    warn: { emoji: '🟡', label: 'WARN' },
    bad: { emoji: '🔴', label: 'BAD' },
  };
  const overall = regressionMap[worst] || regressionMap.none;

  lines.push(
    `**Regression Overall:** ${overall.emoji} ${overall.label}`
  );
  lines.push('');
  lines.push(`Reason: ${reason}`);
  lines.push('');
  lines.push(
    `_Thresholds: GOOD ≤${REGRESSION.GOOD_MAX * 100}% · WARN ≤${REGRESSION.WARN_MAX * 100}% · BAD >${REGRESSION.WARN_MAX * 100}% · non-blocking_`
  );
  lines.push('');

  return lines.join('\n');
}

const baseline = loadBaseline();
const pages = attachRegression(aggregateByPage(loadRuns()), baseline);
process.stdout.write(buildMarkdown(pages, baseline));
