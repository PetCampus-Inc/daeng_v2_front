const nextConfig = {
  // 임시 주소
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // App Router만 사용하고 src/pages는 페이지로 인식하지 않도록 설정
  pageExtensions: ['ts', 'tsx'].map((ext) => `page.${ext}`),
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
