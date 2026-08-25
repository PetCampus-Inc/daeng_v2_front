import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS } from '@knockdog/bridge-core';
import { useBlockingOverlayStore } from '@/features/blocking-overlay';

let lastBlockingOverlayRequestId = 0;
let lastAddressRegistrationDialogRequestId = 0;

/**
 * 시스템 핸들러
 */
export function registerSystemHandlers(router: NativeBridgeRouter) {
  router.register<{ visible: boolean; message: string; requestId: number }>(METHODS.setBlockingOverlay, async (params) => {
    if (params.requestId < lastBlockingOverlayRequestId) {
      return { visible: useBlockingOverlayStore.getState().visible };
    }

    lastBlockingOverlayRequestId = params.requestId;
    const visible = params.visible === true;
    useBlockingOverlayStore.getState().setUploadOverlay(visible, visible ? params.message : '');
    return { visible };
  });

  router.register<{ requestId: number }>(METHODS.showAddressRegistrationDialog, async (params) => {
    if (params.requestId < lastAddressRegistrationDialogRequestId) return { action: 'cancel' as const };

    lastAddressRegistrationDialogRequestId = params.requestId;
    const action = await useBlockingOverlayStore.getState().showAddressRegistrationDialog();
    return { action };
  });

  /** 전화 걸기 */
  router.register(METHODS.callPhone, async (params: { phoneNumber: string }) => {
    const { phoneNumber } = params;

    if (!phoneNumber || phoneNumber.length === 0) {
      throw { code: 'EINVALID', message: '전화번호가 유효하지 않습니다.' };
    }

    // WebView에서 이미 정규화된 번호를 받으므로, 추가 정규화는 최소화
    // 단, 공백과 하이픈만 제거 (이미 WebView에서 숫자, *, #, +만 남긴 상태)
    const normalizedPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

    if (!normalizedPhoneNumber || normalizedPhoneNumber.length === 0) {
      throw { code: 'EINVALID', message: '정규화된 전화번호가 유효하지 않습니다.' };
    }

    const telUrl = `tel:${normalizedPhoneNumber}`;

    // iOS에서도 canOpenURL 체크를 수행 (iOS 9+ 권장)
    // tel: 스키마는 시스템 스키마이지만, 안전을 위해 체크
    try {
      const canOpenURL = await Linking.canOpenURL(telUrl);
      if (!canOpenURL) {
        console.warn('[APP] canOpenURL returned false for tel:', telUrl);
        // iOS에서는 canOpenURL이 false여도 실제로는 열릴 수 있으므로 시도
        if (Platform.OS === 'android') {
          throw { code: 'EUNAVAILABLE', message: '이 기기에서 전화를 걸 수 없습니다.' };
        }
      }
    } catch (canOpenError) {
      // canOpenURL 자체가 실패한 경우 (권한 문제 등)
      if (Platform.OS === 'android') {
        console.error('[APP] canOpenURL check failed:', canOpenError);
        throw { code: 'EUNAVAILABLE', message: '이 기기에서 전화를 걸 수 없습니다.' };
      }
      // iOS에서는 canOpenURL 실패해도 시도
    }

    try {
      const opened = await Linking.openURL(telUrl);
      // Linking.openURL은 Promise<boolean>을 반환하지 않을 수 있으므로
      // 항상 성공으로 간주 (실제로는 시스템이 처리)
      return { opened: true };
    } catch (error) {
      console.error('[APP] openURL error:', error);
      throw { code: 'EUNAVAILABLE', message: '이 기기에서 전화를 걸 수 없습니다.' };
    }
  });

  /** 클립보드 복사 */
  router.register(METHODS.copyToClipboard, async (params: { text: string }) => {
    const { text } = params;
    if (!text || typeof text !== 'string') {
      throw { code: 'EINVALID', message: '클립보드에 복사할 텍스트가 유효하지 않습니다.' };
    }

    // 길이 제한
    const MAX = 100_000;
    const payload = text.length > MAX ? text.slice(0, MAX) : text;

    try {
      await Clipboard.setStringAsync(payload);
      return { copied: true };
    } catch (error) {
      console.error('[APP] copyToClipboard error', error);
      throw { code: 'EUNAVAILABLE', message: '클립보드에 복사할 수 없습니다.' };
    }
  });

  /** 앱 버전 가져오기 */
  router.register(METHODS.getAppVersion, async () => {
    try {
      const version = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
      return { version };
    } catch (error) {
      console.error('[APP] getAppVersion error', error);
      throw { code: 'EUNAVAILABLE', message: '앱 버전을 가져올 수 없습니다.' };
    }
  });

  /** 설정창 열기 */
  router.register(METHODS.openSettings, async () => {
    try {
      await Linking.openSettings();
      return { opened: true };
    } catch (error) {
      console.error('[APP] openSettings error', error);
      throw { code: 'EUNAVAILABLE', message: '설정창을 열 수 없습니다.' };
    }
  });
}
