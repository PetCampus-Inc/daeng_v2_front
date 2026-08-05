import type { ToastShape, ToastPosition, ToastType, ToastTitlePart } from '@knockdog/bridge-core';
import type { ReactNode } from 'react';
import type { ToastStore } from './store';

/**
 * 웹 로컬 Toast Item
 */
export type ToastItem = {
  id: string;
  title?: ReactNode;
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
 * title은 웹에서 ReactNode 하이라이트 가능, 네이티브는 string/titleParts 전송
 */
export type ToastOptions = {
  id?: string;
  title?: ReactNode;
  /** 네이티브 bridge 전송용. title이 ReactNode일 때 사용 */
  nativeTitle?: string;
  /** 네이티브 accent 하이라이트용. 있으면 titleParts로 렌더 */
  titleParts?: ToastTitlePart[];
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
