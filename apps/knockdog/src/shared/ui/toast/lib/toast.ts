'use client';

import type React from 'react';
import type { ToastOptions } from '../model/types';
import { ensureChannel, dismissFromAllChannels, clearAllChannels } from '../model/manager';
import { generateId } from './utils';
import { getDefaults, setDefaults } from '../config/defaults';

function isToastOptions(value: unknown): value is ToastOptions {
  return (
    typeof value === 'object' &&
    value != null &&
    ('id' in value ||
      'duration' in value ||
      'className' in value ||
      'variant' in value ||
      'viewportClassName' in value ||
      'description' in value)
  );
}

function showToast(titleOrOptions: React.ReactNode | ToastOptions, options?: ToastOptions): string {
  const defaults = getDefaults();

  // 오버로드 처리
  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  // viewportClassName이 있으면 해당 채널, 없으면 default 채널 (packages/ui 기본값 사용)
  const { store } = ensureChannel(resolvedOptions.viewportClassName);

  const id = resolvedOptions.id ?? generateId();

  store.getState().push({
    id,
    title: resolvedOptions.title ?? defaults.title,
    description: resolvedOptions.description ?? defaults.description,
    duration: resolvedOptions.duration ?? defaults.duration ?? 2000,
    className: resolvedOptions.className ?? defaults.className,
    variant: resolvedOptions.variant,
    open: true,
  });

  return id;
}

export const toast = Object.assign(showToast, {
  dismiss: dismissFromAllChannels,
  clear: clearAllChannels,
  setDefaults,
});
