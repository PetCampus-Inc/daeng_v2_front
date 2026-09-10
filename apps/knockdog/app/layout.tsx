import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './suit-faces.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import { ClientErrorReporter } from '@app/providers/ClientErrorReporter';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';
import { BridgeProvider } from '@shared/lib/bridge';
import { AnalyticsScreenTracker } from '@shared/lib/analytics';
import { SyncWebViewQueryEffect } from '@shared/lib/sync-webview-query';
import { SyncNativeMainTabModeEffect } from '@features/role-conversion';
import { PushDeviceSyncEffect } from '@features/push';
import { RequireAuthGate } from '@shared/ui/private-access';

const GA_MEASUREMENT_ID = 'G-3XK1LPFE9J';

export const metadata: Metadata = {
  title: {
    default: '똑독',
    template: '똑독 - %s',
  },
  description: '강아지 유치원·반려견 돌봄을 한곳에서. 원장과 보호자를 위한 똑독 웹앱.',
  // favicon은 app/icon.svg 메타데이터 파일 컨벤션 사용 (public/icon.svg와 중복 시 500)
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  // useKeyboardAwareScrollHeight가 visualViewport만 줄어드는 것을 전제로 키보드를 감지하므로
  // 'resizes-content'로 바꾸면 window.innerHeight까지 같이 줄어들어 계산이 깨진다.
  interactiveWidget: 'resizes-visual',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ko' data-env='web' suppressHydrationWarning>
      <head>
        {/* Variable 610KB preload 대신 Regular(~164KB)만 크리티컬 경로에 올린다 */}
        <link
          rel='preload'
          href='/fonts/SUIT-Regular.woff2'
          as='font'
          type='font/woff2'
          crossOrigin='anonymous'
        />
        <link
          rel='preconnect'
          href='https://kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com'
          crossOrigin='anonymous'
        />
        <link
          rel='dns-prefetch'
          href='https://kindergarten-image-bucket.s3.ap-northeast-2.amazonaws.com'
        />
      </head>
      <body className='overflow-hidden'>
        <HeaderProvider>
          {/* gtag stub은 즉시(큐잉), 실스크립트는 idle 이후 — 초기 TBT/LCP 보호 */}
          <Script id='gtag-stub' strategy='beforeInteractive'>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
            `}
          </Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy='lazyOnload'
          />
          <Script id='google-analytics' strategy='lazyOnload'>
            {`
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
            `}
          </Script>
          <ClientErrorReporter />
          <NuqsAdapter>
            <ReactQueryProvider>
              <BridgeProvider>
                <AnalyticsScreenTracker />
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
          {/* Naver Maps는 Map 마운트 시 on-demand 로드 (전역 beforeInteractive는 /mypage 등에서 TBT·unused JS 악화) */}
        </HeaderProvider>
      </body>
    </html>
  );
}
