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

      settings: {
        preset: 'perf',
        formFactor: 'mobile',
        output: ['json'],
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
     * 1) Absolute Health (참고용)
     *    - Web Vitals 절대 등급: Good / Needs Improvement / Poor
     *    - 예: LCP Good ≤2.5s, NI ≤4s, Poor >4s / CLS Good ≤0.1 ...

     * 2) Regression (PR Overall 등급의 기준) — 추후 baseline 비교에서 적용
     *    🟢 GOOD  주요 지표 회귀 ≤10~15%
     *    🟡 WARN  주요 지표 10~25% 악화
     *    🔴 BAD   주요 지표 ≥25% 악화
     *    (※다만, PR merge는 막지 않음)
     *
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
