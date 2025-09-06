import Script from 'next/script';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { cn } from '@knockdog/ui/lib';
import { NaverMapProvider } from '@knockdog/naver-map';

import { suit } from './font';
import './globals.css';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';

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
