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
      'position' in value ||
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

  // position 또는 viewportClassName으로 채널 결정
  // viewportClassName이 우선순위가 높음 (완전 커스텀)
  const { store } = ensureChannel(resolvedOptions.position, resolvedOptions.viewportClassName);

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
