import { cn } from '@knockdog/ui/lib';

import { suit } from './font';
import './globals.css';
import { NaverMapProvider } from '@knockdog/naver-map';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BottomNavBar } from '@widgets/bottom-nav-bar';
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className={cn(suit.variable)}>
      <body>
        <NuqsAdapter>
          <ReactQueryProvider>
            <NaverMapProvider>
              <OverlayProvider>
                <HeaderProvider>
                  <div className='flex h-dvh flex-col'>
                    <HeaderWrapper />
                    {children}
                    <BottomNavBar />
                  </div>
                </HeaderProvider>
              </OverlayProvider>
            </NaverMapProvider>
          </ReactQueryProvider>
        </NuqsAdapter>
        <Script src='//openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=s5hu0lc2kz' strategy='beforeInteractive' />
      </body>
    </html>
  );
}
