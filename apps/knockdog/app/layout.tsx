import type { Metadata } from 'next';
import { cn } from '@knockdog/ui/lib';
import { BottomNavigationBar } from '../src/widgets/BottomNavigationBar';
import HeaderWrapper from '../src/widgets/Header/ui/HeaderExample';

import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { suit } from './font';
import './globals.css';

export const metadata: Metadata = { title: '똑독 견주' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' className={cn(suit.variable)}>
      <body>
        <ReactQueryProvider>
          <HeaderWrapper title='타이틀' />
          <div className='flex h-dvh flex-col'>
            <div className='flex-1 overflow-y-auto p-4'>
              <div className='h-full'>{children}</div>
            </div>
            <BottomNavigationBar />
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
