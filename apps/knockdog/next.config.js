const nextConfig = {
  // 임시 주소
  images: {
    domains: ['images.unsplash.com'],
  },
  // API Proxy
  async rewrites() {
    return [
      {
        source: '/api/v0/:path*',
        destination: 'https://api.knockdog.net/api/v0/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
