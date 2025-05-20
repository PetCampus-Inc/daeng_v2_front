import './globals.css';
import { cn } from '@knockdog/ui/lib';
import type { Metadata } from 'next';
import { pretendard } from 'public/fonts/font';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';

export const metadata: Metadata = { title: '똑독 견주' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' className={cn(pretendard.variable, 'font-pretendard')}>
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
