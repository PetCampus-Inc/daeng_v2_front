'use client;';

import { cn } from '@knockdog/ui/lib';
import { suit } from './font';
import './globals.css';
import { NaverMapProvider } from '@knockdog/naver-map';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import type { Metadata } from 'next';
import { ReactQueryProvider } from '@app/providers/ReactQueryProvider';
import { OverlayProvider } from '@app/providers/OverlayProvider';
import BridgeListenerClient from '@app/_bridge/BridgeListenerClient';
import { HeaderProvider, HeaderWrapper } from '@widgets/Header';

export const metadata: Metadata = { title: 'Knockdog' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // useBridgeListener();

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
                    <BridgeListenerClient />
                    {children}
                  </div>
                </HeaderProvider>
              </OverlayProvider>
            </NaverMapProvider>
          </ReactQueryProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
