import type { ToastShape, ToastPosition, ToastType } from '@knockdog/bridge-core';
import type { ToastStore } from './store';

/**
 * 웹 로컬 Toast Item - string만 지원 (앱과 동일)
 */
export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  duration: number;
  className?: string;
  shape?: ToastShape;
  type?: ToastType;
  open: boolean;
  onOpen?: () => void;
  onClose?: () => void;
};

export type Store = ToastStore;

/**
 * Toast 옵션 - 웹과 앱 모두에서 사용
 * toast() 함수로 호출할 때 사용
 */
export type ToastOptions = {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  className?: string;
  shape?: ToastShape;
  type?: ToastType;
  position?: ToastPosition;
  viewportClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
};

export type ToastDefaults = Omit<ToastOptions, 'id' | 'position' | 'viewportClassName' | 'onOpen' | 'onClose'>;
