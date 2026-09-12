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

      numberOfRuns: 1,
      puppeteerScript: './lighthouse/auth.cjs',
      chromePath: resolveChromePath(),

      settings: {
        preset: 'perf',
        formFactor: 'mobile',
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
  },
};
