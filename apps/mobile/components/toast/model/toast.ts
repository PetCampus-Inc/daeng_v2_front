'use client';

import type { ToastOptions } from '@/types/toast';
import { ensureChannel, dismissFromAllChannels, clearAllChannels } from '../model/manager';
import { generateId } from '../config/utils';
import { getDefaults, setDefaults } from '../config/defaults';

// 웹과 동일: options 판별
function isToastOptions(value: unknown): value is ToastOptions {
  return (
    typeof value === 'object' &&
    value != null &&
    ('id' in value ||
      'title' in value ||
      'duration' in value ||
      'className' in value ||
      'variant' in value || // 존재 체크만 (RN에서 사용 안 함)
      'position' in value ||
      'viewportClassName' in value || // 존재 체크만 (RN에서 사용 안 함)
      'description' in value ||
      'type' in value ||
      'shape' in value)
  );
}

function showToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  const defaults = getDefaults();

  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  // RN에서는 viewportClassName 무시, position만 채널 결정
  const { store } = ensureChannel(resolvedOptions.position, resolvedOptions.viewportClassName);

  const id = resolvedOptions.id ?? generateId();

  store.getState().push({
    id,
    title: resolvedOptions.title ?? defaults.title ?? '',
    description: resolvedOptions.description ?? defaults.description ?? '',
    duration: resolvedOptions.duration ?? defaults.duration ?? 2000,
    shape: resolvedOptions.shape ?? (defaults as any).shape ?? 'rounded',
    type: resolvedOptions.type ?? (defaults as any).type ?? 'default',
    open: true,
    onOpen: resolvedOptions.onOpen,
    onClose: resolvedOptions.onClose,
  });

  return id;
}

export const toast = Object.assign(showToast, {
  dismiss: dismissFromAllChannels,
  clear: clearAllChannels,
  setDefaults,
});
