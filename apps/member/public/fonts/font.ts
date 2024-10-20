import localFont from 'next/font/local';

export const pretendard = localFont({
  src: [
    {
      path: './Pretendard-Light.woff2',
      weight: '400',
    },
    {
      path: './Pretendard-Regular.woff2',
      weight: '500',
    },
    {
      path: './Pretendard-SemiBold.woff2',
      weight: '700',
    },
  ],
  variable: '--pretendard',
  display: 'swap',
  weight: '400',
});
