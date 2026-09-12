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

      settings: {
        preset: 'perf',
        formFactor: 'mobile',
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
