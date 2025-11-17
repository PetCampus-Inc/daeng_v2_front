import type { BridgeEventMap } from '@knockdog/bridge-core';
import type { RefObject } from 'react';
import type { WebView } from 'react-native-webview';

/**
 * 이미지 피커 이벤트 페이로드 타입
 * bridge-core의 BridgeEventMap에서 재사용
 */
export type ImagePickerPayload = BridgeEventMap['media.pickImage'];

/**
 * 이미지 피커 핸들러 타입
 */
export type ImagePickerHandlers = {
  'media.pickImage': (payload: ImagePickerPayload) => Promise<void>;
};

/**
 * 이미지 피커 핸들러 옵션
 */
export interface ImagePickerOptions {
  sendEvent: (event: string, payload?: unknown) => void;
}

/**
 * 이미지 피커 핸들러를 포함한 확장 라우터 타입
 */
export interface ExtendedNativeBridgeRouter {
  imagePickerHandlers?: ImagePickerHandlers;
  getImagePickerHandlers?: () => ImagePickerHandlers | undefined;
  setImagePickerHandlers?: (webRef: RefObject<WebView>, sendEvent: (event: string, payload?: unknown) => void) => void;
}
