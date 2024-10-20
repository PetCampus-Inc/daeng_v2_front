import '@knockdog/ui/globals.css';
import { cn } from '@knockdog/ui/lib';
import type { Metadata } from 'next';

import { pretendard } from 'public/fonts/font';

export const metadata: Metadata = { title: '똑독 관리자' };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko' className={cn(pretendard.variable, 'font-pretendard')}>
      <body>{children}</body>
    </html>
  );
}
