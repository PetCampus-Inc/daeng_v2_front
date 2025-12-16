import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { cn } from '@knockdog/ui/lib';
import { suit } from './font';
import './globals.css';
import type { Viewport } from 'next';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BridgeProvider } from '@shared/lib/bridge';
import { SyncWebViewQueryEffect } from '@shared/lib/sync-webview-query';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className={cn(suit.variable)}>
      <HeaderProvider>
        <body className='overflow-hidden'>
          <NuqsAdapter>
            <ReactQueryProvider>
              <BridgeProvider>
                <OverlayProvider>
                  <SyncWebViewQueryEffect />
                  <div className='relative mx-auto flex h-dvh w-screen max-w-screen-sm flex-col shadow-lg'>
                    {/* @TODO HeaderWrapper 추후 삭제 필요 */}
                    <HeaderWrapper />
                    {children}
                  </div>
                </OverlayProvider>
              </BridgeProvider>
            </ReactQueryProvider>
          </NuqsAdapter>
          <Script src='//openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=s5hu0lc2kz' strategy='beforeInteractive' />
        </body>
      </HeaderProvider>
    </html>
  );
}
