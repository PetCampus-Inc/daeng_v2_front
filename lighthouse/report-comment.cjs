/**
 * lighthouse-results/*.report.json → PR 코멘트 마크다운 생성 (stdout)
 * Absolute Health만 표시. Regression(baseline 대비)은 추후.
 */
const fs = require('fs');
const path = require('path');

const COMMENT_MARKER = '<!-- lighthouse-ci-report -->';
const RESULTS_DIR = path.join(process.cwd(), 'lighthouse-results');

const PAGE_LABELS = {
  '/compare': 'Guardian Kindergarten',
  '/compare/album': 'Guardian Album',
  '/owner/album': 'Owner Album',
  '/mypage': 'Guardian MyPage',
  '/owner/members': 'Owner Members',
};

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function gradeLcp(ms) {
  if (ms == null) return { label: '—', emoji: '⚪' };
  if (ms <= 2500) return { label: 'Good', emoji: '🟢' };
  if (ms <= 4000) return { label: 'NI', emoji: '🟡' };
  return { label: 'Poor', emoji: '🔴' };
}

function gradeCls(score) {
  if (score == null) return { label: '—', emoji: '⚪' };
  if (score <= 0.1) return { label: 'Good', emoji: '🟢' };
  if (score <= 0.25) return { label: 'NI', emoji: '🟡' };
  return { label: 'Poor', emoji: '🔴' };
}

function gradeTbt(ms) {
  if (ms == null) return { label: '—', emoji: '⚪' };
  if (ms <= 200) return { label: 'Good', emoji: '🟢' };
  if (ms <= 600) return { label: 'NI', emoji: '🟡' };
  return { label: 'Poor', emoji: '🔴' };
}

function formatMs(ms) {
  if (ms == null) return '—';
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatMsRaw(ms) {
  if (ms == null) return '—';
  return `${Math.round(ms)}ms`;
}

function pathnameFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function loadRuns() {
  // CI/로컬 모두 최신 autorun 결과만 사용 (.lighthouseci는 매 실행마다 갱신)
  // lighthouse-results는 로컬에서 과거 실행이 누적되어 오염될 수 있음
  const primaryDir = path.join(process.cwd(), '.lighthouseci');
  const fallbackDir = RESULTS_DIR;

  const loadFromDir = (dir, predicate) => {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter(predicate)
      .map((name) => {
        const report = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
        return {
          requestedUrl: report.requestedUrl || report.finalUrl,
          finalUrl: report.finalUrl || report.finalDisplayedUrl,
          performance: report.categories?.performance?.score ?? null,
          fcp: report.audits?.['first-contentful-paint']?.numericValue ?? null,
          lcp: report.audits?.['largest-contentful-paint']?.numericValue ?? null,
          tbt: report.audits?.['total-blocking-time']?.numericValue ?? null,
          cls: report.audits?.['cumulative-layout-shift']?.numericValue ?? null,
          si: report.audits?.['speed-index']?.numericValue ?? null,
        };
      });
  };

  const fromCiDir = loadFromDir(primaryDir, (name) => /^lhr-.*\.json$/.test(name));
  if (fromCiDir.length) return fromCiDir;

  return loadFromDir(fallbackDir, (name) => name.endsWith('.report.json'));
}

function aggregateByPage(runs) {
  const byPath = new Map();

  for (const run of runs) {
    const pathname = pathnameFromUrl(run.requestedUrl);
    const bucket = byPath.get(pathname) || [];
    bucket.push(run);
    byPath.set(pathname, bucket);
  }

  return [...byPath.entries()].map(([pathname, pageRuns]) => {
    const perf = median(pageRuns.map((r) => r.performance).filter((v) => v != null));
    const lcp = median(pageRuns.map((r) => r.lcp).filter((v) => v != null));
    const tbt = median(pageRuns.map((r) => r.tbt).filter((v) => v != null));
    const cls = median(pageRuns.map((r) => r.cls).filter((v) => v != null));
    const fcp = median(pageRuns.map((r) => r.fcp).filter((v) => v != null));
    const redirected = pageRuns.some((r) => pathnameFromUrl(r.finalUrl) !== pathname);

    return {
      pathname,
      label: PAGE_LABELS[pathname] || pathname,
      runs: pageRuns.length,
      performance: perf == null ? null : Math.round(perf * 100),
      lcp,
      tbt,
      cls,
      fcp,
      redirected,
      lcpGrade: gradeLcp(lcp),
      tbtGrade: gradeTbt(tbt),
      clsGrade: gradeCls(cls),
    };
  });
}

function buildMarkdown(pages) {
  const lines = [
    COMMENT_MARKER,
    '## Lighthouse Performance Summary',
    '',
    '_non-blocking · Absolute Health only · Regression(baseline) 추후_',
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
    if (page.redirected) lines.push('');
    if (page.redirected) lines.push('> ⚠️ 최종 URL이 요청 path와 다릅니다 (로그인 리다이렉트 등).');
    lines.push('');
    lines.push('| Metric | Value | Absolute |');
    lines.push('| --- | --- | --- |');
    lines.push(
      `| LCP | ${formatMs(page.lcp)} | ${page.lcpGrade.emoji} ${page.lcpGrade.label} |`
    );
    lines.push(
      `| TBT | ${formatMsRaw(page.tbt)} | ${page.tbtGrade.emoji} ${page.tbtGrade.label} |`
    );
    lines.push(
      `| CLS | ${page.cls == null ? '—' : page.cls.toFixed(3)} | ${page.clsGrade.emoji} ${page.clsGrade.label} |`
    );
    lines.push(`| Performance | ${page.performance ?? '—'} | — |`);
    lines.push(`| FCP | ${formatMs(page.fcp)} | — |`);
    lines.push('');
  }

  const hasPoor = pages.some(
    (p) => p.lcpGrade.label === 'Poor' || p.tbtGrade.label === 'Poor' || p.clsGrade.label === 'Poor'
  );
  const hasNi = pages.some(
    (p) => p.lcpGrade.label === 'NI' || p.tbtGrade.label === 'NI' || p.clsGrade.label === 'NI'
  );

  let overallEmoji = '🟢';
  let overallLabel = 'GOOD';
  let reason = 'Absolute metrics within Good';
  if (hasPoor) {
    overallEmoji = '🔴';
    overallLabel = 'BAD';
    reason = 'Absolute Health Poor 존재 (참고용 · PR 미차단)';
  } else if (hasNi) {
    overallEmoji = '🟡';
    overallLabel = 'WARN';
    reason = 'Absolute Health NI 존재 (참고용 · PR 미차단)';
  }

  lines.push('---');
  lines.push('');
  lines.push(`**Overall (Absolute, 참고):** ${overallEmoji} ${overallLabel}`);
  lines.push('');
  lines.push(`Reason: ${reason}`);
  lines.push('');
  lines.push('**Regression Overall:** — (baseline 비교 추후)');
  lines.push('');

  return lines.join('\n');
}

const pages = aggregateByPage(loadRuns());
process.stdout.write(buildMarkdown(pages));
