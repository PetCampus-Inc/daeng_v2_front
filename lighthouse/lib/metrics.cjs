const fs = require('fs');
const path = require('path');

const COMMENT_MARKER = '<!-- lighthouse-ci-report -->';
const RESULTS_DIR = path.join(process.cwd(), 'lighthouse-results');
const LIGHTHOUSE_CI_DIR = path.join(process.cwd(), '.lighthouseci');
const BASELINE_PATH = path.join(process.cwd(), 'lighthouse', 'baselines', 'latest.json');

const PAGE_LABELS = {
  '/compare': 'Guardian Kindergarten',
  '/compare/album': 'Guardian Album',
  '/owner/album': 'Owner Album',
  '/mypage': 'Guardian MyPage',
  '/owner/members': 'Owner Members',
};

/** LHCI numberOfRuns 과 동일 — baseline / Regression Overall 완전성 기준 */
const REQUIRED_RUNS = 3;

/** Regression Overall thresholds (악화율) */
const REGRESSION = {
  GOOD_MAX: 0.15, // ≤15%
  WARN_MAX: 0.25, // ≤25%
};

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function pathnameFromUrl(url) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
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

function formatPct(pct) {
  if (pct == null) return '—';
  const signed = pct > 0 ? `+${(pct * 100).toFixed(1)}%` : `${(pct * 100).toFixed(1)}%`;
  return signed;
}

function loadRuns() {
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

  const fromCiDir = loadFromDir(LIGHTHOUSE_CI_DIR, (name) => /^lhr-.*\.json$/.test(name));
  if (fromCiDir.length) return fromCiDir;
  return loadFromDir(RESULTS_DIR, (name) => name.endsWith('.report.json'));
}

function isRedirectRun(run, requestedPathname) {
  return pathnameFromUrl(run.finalUrl) !== requestedPathname;
}

/**
 * requestedUrl pathname 기준으로 집계.
 * finalUrl이 다르면 redirect로 분리하고, 메트릭/baseline/Overall에는 제외.
 */
function aggregateByPage(runs) {
  const byPath = new Map();

  for (const run of runs) {
    const pathname = pathnameFromUrl(run.requestedUrl);
    const bucket = byPath.get(pathname) || [];
    bucket.push(run);
    byPath.set(pathname, bucket);
  }

  return [...byPath.entries()].map(([pathname, pageRuns]) => {
    const redirectRuns = pageRuns.filter((r) => isRedirectRun(r, pathname));
    const validRuns = pageRuns.filter((r) => !isRedirectRun(r, pathname));

    const perf = median(validRuns.map((r) => r.performance).filter((v) => v != null));
    const lcp = median(validRuns.map((r) => r.lcp).filter((v) => v != null));
    const tbt = median(validRuns.map((r) => r.tbt).filter((v) => v != null));
    const cls = median(validRuns.map((r) => r.cls).filter((v) => v != null));
    const fcp = median(validRuns.map((r) => r.fcp).filter((v) => v != null));

    return {
      pathname,
      label: PAGE_LABELS[pathname] || pathname,
      runs: validRuns.length,
      redirectCount: redirectRuns.length,
      performance: perf == null ? null : Math.round(perf * 100),
      lcp,
      tbt,
      cls,
      fcp,
      redirected: redirectRuns.length > 0,
      lcpGrade: gradeLcp(lcp),
      tbtGrade: gradeTbt(tbt),
      clsGrade: gradeCls(cls),
    };
  });
}

/**
 * PAGE_LABELS 전 경로가 유효(non-redirect) run 정확히 REQUIRED_RUNS개인지 검사.
 */
function assessCompleteness(pages) {
  const byPath = new Map(pages.map((page) => [page.pathname, page]));
  const expectedPaths = Object.keys(PAGE_LABELS);
  const missing = [];
  const fewerThanRequired = [];
  const moreThanRequired = [];

  for (const pathname of expectedPaths) {
    const page = byPath.get(pathname);
    if (!page) {
      missing.push(pathname);
      continue;
    }
    if (page.runs < REQUIRED_RUNS) fewerThanRequired.push({ pathname, runs: page.runs });
    if (page.runs > REQUIRED_RUNS) moreThanRequired.push({ pathname, runs: page.runs });
  }

  const complete =
    missing.length === 0 && fewerThanRequired.length === 0 && moreThanRequired.length === 0;

  return {
    complete,
    requiredRuns: REQUIRED_RUNS,
    expectedPaths,
    missing,
    fewerThanRequired,
    moreThanRequired,
  };
}

function formatCompletenessIssues(completeness) {
  const lines = [];
  if (completeness.missing.length) {
    lines.push(`missing: ${completeness.missing.join(', ')}`);
  }
  if (completeness.fewerThanRequired.length) {
    lines.push(
      `fewer than ${completeness.requiredRuns} runs: ${completeness.fewerThanRequired
        .map((item) => `${item.pathname} (${item.runs})`)
        .join(', ')}`
    );
  }
  if (completeness.moreThanRequired.length) {
    lines.push(
      `more than ${completeness.requiredRuns} runs: ${completeness.moreThanRequired
        .map((item) => `${item.pathname} (${item.runs})`)
        .join(', ')}`
    );
  }
  return lines;
}

function toBaselinePayload(pages) {
  return {
    savedAt: new Date().toISOString(),
    pages: pages.map((page) => ({
      pathname: page.pathname,
      label: page.label,
      performance: page.performance,
      lcp: page.lcp,
      tbt: page.tbt,
      cls: page.cls,
      fcp: page.fcp,
    })),
  };
}

function loadBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

function saveBaseline(pages) {
  const completeness = assessCompleteness(pages);
  if (!completeness.complete) {
    const error = new Error(
      `Incomplete Lighthouse results — cannot save baseline.\n${formatCompletenessIssues(completeness).join('\n')}`
    );
    error.completeness = completeness;
    throw error;
  }

  // redirect run은 aggregate에서 이미 제외됨 — 유효 메트릭만 저장
  const labeledPages = pages.filter((page) => PAGE_LABELS[page.pathname]);
  const dir = path.dirname(BASELINE_PATH);
  fs.mkdirSync(dir, { recursive: true });
  const payload = toBaselinePayload(labeledPages);
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

/**
 * 양수 = 악화 / Performance는 높을수록 좋아서 반대로 계산.
 * CLS는 baseline이 매우 작으면 절대 delta로 환산.
 */
function regressionRatio(current, baseline, { higherIsBetter = false, metric = '' } = {}) {
  if (current == null || baseline == null) return null;

  if (metric === 'cls') {
    const delta = current - baseline;
    if (baseline < 0.05) {
      if (delta <= 0.05) return Math.min(0, delta); // 개선/미세변화 → GOOD 대역
      if (delta <= 0.1) return 0.2; // WARN
      return 0.3; // BAD
    }
  }

  if (baseline === 0) {
    if (higherIsBetter) return current < 0 ? 1 : 0;
    return current > 0 ? 1 : 0;
  }

  if (higherIsBetter) return (baseline - current) / baseline;
  return (current - baseline) / baseline;
}

function gradeRegression(ratio) {
  if (ratio == null) return { label: '—', emoji: '⚪', key: 'none' };
  if (ratio <= REGRESSION.GOOD_MAX) return { label: 'Stable', emoji: '🟢', key: 'good' };
  if (ratio <= REGRESSION.WARN_MAX) return { label: 'Warn', emoji: '🟡', key: 'warn' };
  return { label: 'Bad', emoji: '🔴', key: 'bad' };
}

function attachRegression(pages, baseline) {
  if (!baseline?.pages?.length) {
    return pages.map((page) => ({ ...page, baseline: null, regressions: null }));
  }

  const byPath = new Map(baseline.pages.map((page) => [page.pathname, page]));

  return pages.map((page) => {
    const base = byPath.get(page.pathname);
    if (!base) return { ...page, baseline: null, regressions: null };

    const lcpRatio = regressionRatio(page.lcp, base.lcp, { metric: 'lcp' });
    const tbtRatio = regressionRatio(page.tbt, base.tbt, { metric: 'tbt' });
    const clsRatio = regressionRatio(page.cls, base.cls, { metric: 'cls' });
    const perfRatio = regressionRatio(page.performance, base.performance, {
      higherIsBetter: true,
      metric: 'performance',
    });

    return {
      ...page,
      baseline: base,
      regressions: {
        lcp: { ratio: lcpRatio, grade: gradeRegression(lcpRatio), baseline: base.lcp, current: page.lcp },
        tbt: { ratio: tbtRatio, grade: gradeRegression(tbtRatio), baseline: base.tbt, current: page.tbt },
        cls: { ratio: clsRatio, grade: gradeRegression(clsRatio), baseline: base.cls, current: page.cls },
        performance: {
          ratio: perfRatio,
          grade: gradeRegression(perfRatio),
          baseline: base.performance,
          current: page.performance,
        },
      },
    };
  });
}

function worstRegressionKey(pages) {
  const rank = { none: 0, good: 1, warn: 2, bad: 3 };
  let worst = 'none';
  let reason = 'baseline 없음';

  for (const page of pages) {
    // redirect run은 aggregate에서 제외됨. 유효 run이 없으면 Overall에서 스킵
    if (!page.regressions || page.runs === 0) continue;
    for (const [metric, item] of Object.entries(page.regressions)) {
      if (!item?.grade || item.grade.key === 'none') continue;
      if (rank[item.grade.key] > rank[worst]) {
        worst = item.grade.key;
        reason = `${page.label} ${metric.toUpperCase()} ${formatPct(item.ratio)}`;
      }
    }
  }

  return { worst, reason };
}

module.exports = {
  COMMENT_MARKER,
  BASELINE_PATH,
  PAGE_LABELS,
  REQUIRED_RUNS,
  REGRESSION,
  loadRuns,
  aggregateByPage,
  assessCompleteness,
  formatCompletenessIssues,
  loadBaseline,
  saveBaseline,
  attachRegression,
  worstRegressionKey,
  formatMs,
  formatMsRaw,
  formatPct,
  gradeLcp,
  gradeTbt,
  gradeCls,
};
