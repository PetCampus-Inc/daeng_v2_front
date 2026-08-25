import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { cn } from '@knockdog/ui/lib';
import { suit } from './font';
import './globals.css';
import type { Viewport } from 'next';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import { ClientErrorReporter } from '@app/providers/ClientErrorReporter';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BridgeProvider } from '@shared/lib/bridge';
import { SyncWebViewQueryEffect } from '@shared/lib/sync-webview-query';
import { SyncNativeMainTabModeEffect } from '@features/role-conversion';
import { PushDeviceSyncEffect } from '@features/push';
import { RequireAuthGate } from '@shared/ui/private-access';

const GA_MEASUREMENT_ID = 'G-3XK1LPFE9J';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' className={cn(suit.variable)} data-env='web' suppressHydrationWarning>
      <HeaderProvider>
        <body className='overflow-hidden'>
          {/* Google Analytics */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='afterInteractive'
          />
          <Script id='google-analytics' strategy='afterInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
          <ClientErrorReporter />
          <NuqsAdapter>
            <ReactQueryProvider>
              <BridgeProvider>
                <SyncWebViewQueryEffect />
                <SyncNativeMainTabModeEffect />
                <PushDeviceSyncEffect />
                <div
                  id='root'
                  className='webview:max-w-full relative mx-auto flex h-dvh w-screen max-w-120 flex-col shadow-lg'
                >
                  <RequireAuthGate>
                    <OverlayProvider>
                      {/* @TODO HeaderWrapper 추후 삭제 필요 */}
                      <HeaderWrapper />
                      {children}
                    </OverlayProvider>
                  </RequireAuthGate>
                </div>
              </BridgeProvider>
            </ReactQueryProvider>
          </NuqsAdapter>
          <Script
            src='https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=s5hu0lc2kz'
            strategy='beforeInteractive'
          />
        </body>
      </HeaderProvider>
    </html>
  );
}
