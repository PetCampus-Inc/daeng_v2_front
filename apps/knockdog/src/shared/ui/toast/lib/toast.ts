'use client';

import type { ToastOptions } from '../model/types';
import { ensureChannel, dismissFromAllChannels, clearAllChannels } from '../model/manager';
import { generateId } from './utils';
import { getDefaults, setDefaults } from '../config/defaults';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';
import { getBridgeInstance } from '@shared/lib/bridge';
import { METHODS, type ToastShowParams } from '@knockdog/bridge-core';
import { isValidElement } from 'react';

function isToastOptions(value: unknown): value is ToastOptions {
  if (typeof value !== 'object' || value == null) return false;
  if (Array.isArray(value) || isValidElement(value as any)) return false;

  return (
    typeof value === 'object' &&
    value != null &&
    ('title' in value ||
      'description' in value ||
      'duration' in value ||
      'position' in value ||
      'viewportClassName' in value ||
      'className' in value ||
      'shape' in value ||
      'type' in value ||
      'onOpen' in value ||
      'onClose' in value)
  );
}

function showToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  const defaults = getDefaults();

  // 오버로드 처리
  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  const id = resolvedOptions.id ?? generateId();

  // 네이티브 환경인 경우 bridge를 통해 앱 toast 호출
  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (bridge) {
      const params: ToastShowParams = {
        id,
        title: resolvedOptions.title,
        description: resolvedOptions.description,
        duration: resolvedOptions.duration,
        position: resolvedOptions.position,
        shape: resolvedOptions.shape,
        type: resolvedOptions.type,
      };
      bridge.request(METHODS.toastShow, params).catch((error) => {
        console.error('[toast] Bridge request failed:', error);
      });
      return id;
    }
  }

  // 웹 환경인 경우 로컬 toast 사용
  // position 또는 viewportClassName으로 채널 결정
  // viewportClassName이 우선순위가 높음 (완전 커스텀)
  const { store } = ensureChannel(resolvedOptions.position, resolvedOptions.viewportClassName);

  store.getState().push({
    id,
    title: resolvedOptions.title ?? defaults.title,
    description: resolvedOptions.description ?? defaults.description,
    duration: resolvedOptions.duration ?? defaults.duration ?? 2000,
    className: resolvedOptions.className ?? defaults.className,
    shape: resolvedOptions.shape ?? defaults.shape,
    type: resolvedOptions.type ?? defaults.type,
    open: true,
    onOpen: resolvedOptions.onOpen,
    onClose: resolvedOptions.onClose,
  });

  return id;
}

function dismissToast(id?: string): void {
  // 네이티브 환경인 경우 bridge를 통해 앱 toast dismiss
  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (bridge) {
      bridge.request(METHODS.toastDismiss, { id }).catch((error) => {
        console.error('[toast] Bridge dismiss failed:', error);
      });
      return;
    }
  }

  // 웹 환경인 경우 로컬 toast dismiss
  if (id) {
    dismissFromAllChannels(id);
  }
}

function clearToast(): void {
  // 네이티브 환경인 경우 bridge를 통해 앱 toast clear
  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (bridge) {
      bridge.request(METHODS.toastClear, {}).catch((error) => {
        console.error('[toast] Bridge clear failed:', error);
      });
      return;
    }
  }

  // 웹 환경인 경우 로컬 toast clear
  clearAllChannels();
}

export const toast = Object.assign(showToast, {
  dismiss: dismissToast,
  clear: clearToast,
  setDefaults,
});
