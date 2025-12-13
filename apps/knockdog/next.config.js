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
      {
        protocol: 'http',
        hostname: 'blogpfthumb.phinf.naver.net',
      },
    ],
  },
};

module.exports = nextConfig;
