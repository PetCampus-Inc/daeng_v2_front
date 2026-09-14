const fs = require('fs');

function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/compare',
        'http://localhost:3000/compare/album',
        'http://localhost:3000/owner/album',
        'http://localhost:3000/mypage',
        'http://localhost:3000/owner/members',
      ],

      numberOfRuns: 3,
      puppeteerScript: './lighthouse/auth.cjs',
      chromePath: resolveChromePath(),
      // GitHub Actions애서는 unprivileged user namespace sandbox로 불가
      puppeteerLaunchOptions: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },

      settings: {
        preset: 'perf',
        formFactor: 'mobile',
        output: ['json'],
        chromeFlags: '--no-sandbox --disable-setuid-sandbox',
        // localStorage ACCESS_TOKEN / USER 유지 (게스트 로그인 세션)
        disableStorageReset: true,
        screenEmulation: {
          mobile: true,
          width: 390,
          height: 844,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    },

    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-results',
    },

    /**
     * Performance monitoring 설계
     *
     * 1) Absolute Health (참고용) — Web Vitals Good/NI/Poor
     * 2) Regression Overall (PR 등급) — baseline 대비 악화율
     *    🟢 GOOD ≤15% / 🟡 WARN ≤25% / 🔴 BAD >25%
     *    ※ non-blocking (PR merge 미차단)
     *
     * baseline: lighthouse/baselines/latest.json
     * 저장: pnpm lighthouse:baseline
     * 코멘트: pnpm lighthouse:comment
     */
    assert: {
      aggregationMethod: 'median',
      assertions: {
        'categories:performance': ['warn', { minScore: 0.4 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 6000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 800 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.25 }],
        'speed-index': ['warn', { maxNumericValue: 8000 }],
      },
    },
  },
};
