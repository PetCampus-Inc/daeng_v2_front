if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_GUEST_LOGIN === 'true'
) {
  throw new Error(
    'NEXT_PUBLIC_ENABLE_GUEST_LOGIN must be unset/false for production builds. Use apps/knockdog/.env.development for local only.'
  );
}

const nextConfig = {
  transpilePackages: ["@knockdog/bridge-core", "@knockdog/bridge-web"],
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
    ];
  },
  // 임시 주소
  images: {
    // AVIF는 일부 AOS WebView에서 디코드 실패 → broken/placeholder. webp만 사용.
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'blogpfthumb.phinf.naver.net',
      },
    ],
  },
};

module.exports = nextConfig;
