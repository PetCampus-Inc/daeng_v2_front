'use client';

import type { ToastOptions } from '../model/types';
import { ensureChannel, dismissFromAllChannels, clearAllChannels } from '../model/manager';
import { generateId } from './utils';
import { getDefaults, setDefaults } from '../config/defaults';
import { measureBottomCtaOffset, measureBottomNavOffset } from './measureBottomCtaOffset';
import {
  TOAST_BOTTOM_GAP_VAR,
  TOAST_BOTTOM_OFFSET_VAR,
  TOAST_GAP_ABOVE_BOTTOM_NAV,
  TOAST_GAP_ABOVE_CTA,
  TOAST_GAP_ABOVE_SAFE_AREA,
  TOAST_SAFE_AREA_BOTTOM,
} from './position-styles';
import { shouldWaitForViewport, waitForViewportSettled } from './waitForViewportSettled';
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

/**
 * 웹 토스트의 아래 위치를 CSS 변수로 반영한다.
 * - CTA가 있으면: CTA 버튼 윗면 위 16px
 * - CTA가 없고 하단 탭바가 있으면: 탭바 윗면 위 16px
 * - 둘 다 없으면: Safe Area 위 20px
 */
function applyWebBottomOffset(ctaOffset?: number): void {
  const { style } = document.documentElement;
  const navOffset = ctaOffset === undefined ? measureBottomNavOffset() : undefined;

  if (ctaOffset !== undefined) {
    style.setProperty(TOAST_BOTTOM_OFFSET_VAR, `${ctaOffset}px`);
    style.setProperty(TOAST_BOTTOM_GAP_VAR, `${TOAST_GAP_ABOVE_CTA}px`);
  } else if (navOffset !== undefined) {
    style.setProperty(TOAST_BOTTOM_OFFSET_VAR, `${navOffset}px`);
    style.setProperty(TOAST_BOTTOM_GAP_VAR, `${TOAST_GAP_ABOVE_BOTTOM_NAV}px`);
  } else {
    style.setProperty(TOAST_BOTTOM_OFFSET_VAR, TOAST_SAFE_AREA_BOTTOM);
    style.setProperty(TOAST_BOTTOM_GAP_VAR, `${TOAST_GAP_ABOVE_SAFE_AREA}px`);
  }
}

/** 화면이 안정되길 기다리는 중이라 아직 띄우지 않은 토스트 id. 기다리는 중 `dismiss`·`clear`가 불리면 띄우지 않는다. */
const pendingToastIds = new Set<string>();

/** 토스트를 실제로 띄운다. 하단 토스트는 이 시점의 CTA 위치를 잰다. */
function presentToast(id: string, resolvedOptions: ToastOptions): void {
  const defaults = getDefaults();

  // 하단 토스트는 화면 하단 CTA 위에 뜬다. top, bottom-above-nav는 대상이 아니다.
  const isBottomPosition = resolvedOptions.position === undefined || resolvedOptions.position === 'bottom';
  const bottomOffset = isBottomPosition ? measureBottomCtaOffset() : undefined;

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
        bottomOffset,
      };
      bridge.request(METHODS.toastShow, params).catch((error) => {
        console.error('[toast] Bridge request failed:', error);
      });
      return;
    }
  }

  // 웹 환경인 경우 로컬 toast 사용
  // position 또는 viewportClassName으로 채널 결정
  // viewportClassName이 우선순위가 높음 (완전 커스텀)
  applyWebBottomOffset(bottomOffset);
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
}

function showToast(titleOrOptions: string | ToastOptions, options?: ToastOptions): string {
  // 오버로드 처리
  const resolvedOptions = isToastOptions(titleOrOptions)
    ? titleOrOptions
    : ({ title: titleOrOptions, ...options } as ToastOptions);

  const id = resolvedOptions.id ?? generateId();

  // 우선 토스트가 떠 있는 동안에는 다른 토스트를 띄우지 않는다
  if (Date.now() < priorityUntil) return id;

  // 하단 토스트는 키보드가 열리거나 닫히는 중이면 화면이 안정된 뒤에 띄운다.
  // 키보드가 아직 올라와 있을 때 CTA 위치를 재면, 키보드가 내려간 뒤에 토스트가 너무 높게 남는다.
  const isBottomPosition = resolvedOptions.position === undefined || resolvedOptions.position === 'bottom';
  if (isBottomPosition && shouldWaitForViewport()) {
    pendingToastIds.add(id);
    waitForViewportSettled().then(() => {
      if (!pendingToastIds.delete(id)) return;
      presentToast(id, resolvedOptions);
    });
    return id;
  }

  presentToast(id, resolvedOptions);
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
  // 아직 띄우지 않고 기다리는 토스트면 띄우지 않는다
  if (id) pendingToastIds.delete(id);

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
  // 아직 띄우지 않고 기다리는 토스트도 모두 취소한다
  pendingToastIds.clear();

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
