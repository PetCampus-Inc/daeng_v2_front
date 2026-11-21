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
      'titleParts' in value ||
      'icon' in value ||
      'iconAccent' in value ||
      'bottomOffset' in value ||
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

/** 웹에서 온 값이 0 이상 유한한 숫자일 때만 쓴다. 그 외(NaN, 음수, 문자열 등)는 무시해 기본 위치로 둔다. */
function toValidBottomOffset(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function showToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  const defaults = getDefaults();

  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  // RN에서는 viewportClassName 무시, position만 채널 결정
  const { store } = ensureChannel(resolvedOptions.position, resolvedOptions.viewportClassName);

  // 화면에는 항상 토스트 1개만 — 채널 무관하게 새 토스트가 뜨면 기존 걸 교체
  clearAllChannels();

  const id = resolvedOptions.id ?? generateId();

  const titleParts = resolvedOptions.titleParts;
  const titleFromParts = titleParts?.map((part) => part.text).join('');

  store.getState().push({
    id,
    title: resolvedOptions.title ?? titleFromParts ?? defaults.title ?? '',
    titleParts,
    description: resolvedOptions.description ?? defaults.description ?? '',
    duration: resolvedOptions.duration ?? defaults.duration ?? 2000,
    shape: resolvedOptions.shape ?? (defaults as any).shape ?? 'rounded',
    type: resolvedOptions.type ?? (defaults as any).type ?? 'default',
    icon: resolvedOptions.icon,
    iconAccent: resolvedOptions.iconAccent,
    bottomOffset: toValidBottomOffset(resolvedOptions.bottomOffset),
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
