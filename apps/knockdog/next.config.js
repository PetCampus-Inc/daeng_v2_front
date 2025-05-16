const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const assetPrefix = isProduction ? 'https://d1r26dalybj5h.cloudfront.net' : '';

const nextConfig = {
  output: 'standalone',
  assetPrefix,
  images: {
    loader: 'default',
    path: assetPrefix,
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};

module.exports = nextConfig;
