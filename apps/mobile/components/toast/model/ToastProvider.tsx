import React from 'react';
import { Portal } from '@gorhom/portal';
import { __channelStores } from './manager';
import { ToastViewport } from '../ui/ToastViewport';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Portal>
        <ToastViewport store={__channelStores.top} position='top' />
        <ToastViewport store={__channelStores.bottom} position='bottom' />
        <ToastViewport store={__channelStores.bottomAboveNav} position='bottom-above-nav' />
      </Portal>
    </>
  );
}
