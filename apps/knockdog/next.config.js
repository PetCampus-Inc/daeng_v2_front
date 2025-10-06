const nextConfig = {
  // 임시 주소
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com',
      },
    ],
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
