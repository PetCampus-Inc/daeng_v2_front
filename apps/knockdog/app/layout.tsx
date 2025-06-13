import { cn } from '@knockdog/ui/lib';

import { suit } from './font';
import './globals.css';
import { NaverMapProvider } from '@knockdog/naver-map';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BottomNavigationBar } from '@widgets/bottom-bar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko' className={cn(suit.variable)}>
      <body>
        <ReactQueryProvider>
          <NaverMapProvider>
            <HeaderProvider>
              <div className='flex h-dvh flex-col'>
                <HeaderWrapper />
                {children}
                <div className='fixed inset-x-0 bottom-0 z-50'>
                  <BottomNavigationBar />
                </div>
              </div>
            </HeaderProvider>
          </NaverMapProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
