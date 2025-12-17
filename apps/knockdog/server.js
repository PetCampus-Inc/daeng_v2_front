const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// Next.js가 자동으로 NODE_ENV를 설정하도록 함
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, turbopack: true });
const handle = app.getRequestHandler();

const proxyMiddleware = createProxyMiddleware({
  target: 'https://api.knockdog.net',
  changeOrigin: true,
  pathRewrite: { '^/': '/api/v0/' },
  cookieDomainRewrite: { '*': '' }, // 쿠키 도메인 제거 (localhost에서는 Domain 생략 필요)
  logLevel: 'debug', // 로그 활성화 (디버깅용)
  on: {
    proxyRes: (proxyRes, req, res) => {
      // set-cookie 헤더 수정 (localhost 환경에 맞게)
      if (proxyRes.headers['set-cookie']) {
        const originalCookies = proxyRes.headers['set-cookie'];
        proxyRes.headers['set-cookie'] = originalCookies.map((cookie) => {
          let modified = cookie;

          // Secure 속성 제거
          modified = modified.replace(/;\s*Secure/gi, '');
          modified = modified.replace(/Secure;\s*/gi, '');
          modified = modified.replace(/Secure$/gi, '');

          return modified;
        });
      }
    },
    error: (err, req, res) => {
      console.error('[PROXY ERROR]', err);
      if (!res.headersSent) res.status(502);
      res.end('Bad Gateway');
    },
  },
});

app.prepare().then(() => {
  const server = express();

  server.use('/api/v0', proxyMiddleware);
  // ───────────────────────────────────────────────

  // ─── Next.js 라우팅 ────────────────────────────
  server.all('/{*splat}', (req, res) => {
    return handle(req, res);
  });
  // ───────────────────────────────────────────────

  server.listen(3000, () => {
    console.log(`> Ready on http://localhost:3000`);
  });
});
