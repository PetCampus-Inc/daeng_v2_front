const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
const assetPrefix = isProduction ? process.env.NEXT_PUBLIC_ASSET_PREFIX : '';

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
