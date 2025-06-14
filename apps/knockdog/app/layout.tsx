import { cn } from '@knockdog/ui/lib';

import { suit } from './font';
import './globals.css';

import { NaverMapProvider } from '@knockdog/naver-map';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BottomNavigationBar } from '@widgets/BottomNavigationBar';

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
                <div className='flex-1'>
                  <div>{children}</div>
                </div>
                <BottomNavigationBar />
              </div>
            </HeaderProvider>
          </NaverMapProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
