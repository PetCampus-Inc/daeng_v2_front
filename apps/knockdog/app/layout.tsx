import { cn } from '@knockdog/ui/lib';

import HeaderWrapper from '../src/widgets/Header/ui/HeaderWrapper';
import { HeaderProvider } from '../src/widgets/Header/model/HeaderProvider';

import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { NaverMapProvider } from '@knockdog/naver-map';
import { suit } from './font';
import './globals.css';
import { BottomNavigationBar } from '@widgets/bottom-bar';

// export const metadata: Metadata = { title: '똑독 견주' };

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
