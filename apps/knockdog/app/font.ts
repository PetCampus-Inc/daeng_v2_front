import localFont from 'next/font/local';

export const suit = localFont({
  src: '../public/fonts/SUIT-Variable.woff2',
  weight: '100 900',
  variable: '--font-suit',
  display: 'swap',
  // SUIT에 없는 희귀 완성형 한글 음절을 만났을 때 Arial(자동 생성 fallback)에서
  // 바로 끊기지 않고 시스템 한글 폰트까지 이어지도록 명시한다.
  fallback: ['Apple SD Gothic Neo', 'sans-serif'],
});
