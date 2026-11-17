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
      'nativeTitle' in value ||
      'titleParts' in value ||
      'icon' in value ||
      'iconAccent' in value ||
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

/** 우선 토스트가 뜬 뒤 다른 토스트를 막아 두는 시간(ms). 같은 실패에 대한 화면별 토스트가 덮어쓰지 못하게 한다. */
const PRIORITY_TOAST_HOLD_MS = 1000;
let priorityUntil = 0;

function showToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  const defaults = getDefaults();

  // 오버로드 처리
  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  const id = resolvedOptions.id ?? generateId();

  // 우선 토스트가 떠 있는 동안에는 다른 토스트를 띄우지 않는다
  if (Date.now() < priorityUntil) return id;

  // 네이티브 환경인 경우 bridge를 통해 앱 toast 호출
  if (isNativeWebView()) {
    const bridge = getBridgeInstance();
    if (bridge) {
      const titleFromParts = resolvedOptions.titleParts?.map((part) => part.text).join('');
      const params: ToastShowParams = {
        id,
        title:
          typeof resolvedOptions.title === 'string'
            ? resolvedOptions.title
            : (resolvedOptions.nativeTitle ?? titleFromParts ?? ''),
        titleParts: resolvedOptions.titleParts,
        description: resolvedOptions.description,
        duration: resolvedOptions.duration,
        position: resolvedOptions.position,
        shape: resolvedOptions.shape,
        type: resolvedOptions.type,
        icon: resolvedOptions.icon,
        iconAccent: resolvedOptions.iconAccent,
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

  // 화면에는 항상 토스트 1개만 — 채널 무관하게 새 토스트가 뜨면 기존 걸 교체
  clearAllChannels();

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

/**
 * 다른 토스트보다 먼저 보여 줘야 하는 토스트를 띄운다.
 * 이후 잠시(`PRIORITY_TOAST_HOLD_MS`) 동안 일반 토스트는 무시된다.
 */
function showPriorityToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  priorityUntil = 0;
  const id = showToast(titleOrOptions, options);
  priorityUntil = Date.now() + PRIORITY_TOAST_HOLD_MS;
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
  priority: showPriorityToast,
  dismiss: dismissToast,
  clear: clearToast,
  setDefaults,
});
