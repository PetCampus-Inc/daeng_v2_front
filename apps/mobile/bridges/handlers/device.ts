import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { Platform, Share } from 'react-native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type ShareParams, type ShareResult } from '@knockdog/bridge-core';

/**
 * 디바이스 핸들러 등록
 * @param router
 */
export function registerDeviceHandlers(router: NativeBridgeRouter) {
  // 위도, 경도 가져오기
  router.register(METHODS.getLatLng, async (options?: { accuracy?: 'balanced' | 'high' }) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw { code: 'EPERMISSION', message: '위치 권한 거부' };

    const acc = options?.accuracy === 'high' ? Location.Accuracy.High : Location.Accuracy.Balanced;

    const position = await Location.getCurrentPositionAsync({ accuracy: acc });

    return { lat: position.coords.latitude, lng: position.coords.longitude };
  });

  // 전화 걸기
  router.register(METHODS.callPhone, async (params: { phoneNumber: string }) => {
    const { phoneNumber } = params;

    if (!phoneNumber || phoneNumber.length === 0) {
      throw { code: 'EINVALID', message: '전화번호가 유효하지 않습니다.' };
    }

    // 시뮬레이터 환경 체크
    const isEmulator = !Constants.isDevice;

    if (isEmulator) {
      console.log('[APP] 시뮬레이터/에뮬레이터 환경에서 전화 기능 사용 불가');
      console.log(`[APP] 전화번호: ${phoneNumber} (시뮬레이터에서는 실제 전화가 걸리지 않습니다)`);

      // 개발 환경에서는 시뮬레이터에서도 성공으로 처리 (테스트용)
      if (__DEV__) {
        console.log('[APP] 개발 모드: 시뮬레이터에서도 전화 성공으로 처리');
        return { opened: true, simulated: true };
      }

      throw { code: 'ESIMULATOR', message: '시뮬레이터에서는 전화를 걸 수 없습니다.' };
    }

    const canOpenURL = await Linking.canOpenURL(`tel:${phoneNumber}`);

    if (!canOpenURL) {
      throw { code: 'EUNAVAILABLE', message: '이 기기에서 전화를 걸 수 없습니다.' };
    }

    await Linking.openURL(`tel:${phoneNumber}`);

    return { opened: true };
  });

  // 클립보드
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

  // 공유하기
  router.register(METHODS.share, async (params: ShareParams): Promise<ShareResult> => {
    const { message, url, subject, excludedActivityTypes, tintColor, title, dialogTitle } = params ?? {};

    if (!message && !url) {
      throw { code: 'EINVALID', message: '공유할 메시지 또는 URL이 필요합니다.' };
    }

    try {
      // React Native Share는 message가 필수이므로 기본값 설정
      const shareMessage = message || url || '';

      const content: { message: string; url?: string; title?: string } = {
        message: shareMessage,
      };

      // URL 설정
      if (url) {
        content.url = url;
      }

      // 플랫폼별 제목 설정
      if (Platform.OS === 'ios' && subject) {
        content.title = subject;
      } else if (Platform.OS === 'android' && title) {
        content.title = title;
      }

      // 플랫폼별 옵션 설정
      const options: {
        dialogTitle?: string;
        excludedActivityTypes?: string[];
        tintColor?: string;
      } = {};

      if (Platform.OS === 'android' && dialogTitle) {
        options.dialogTitle = dialogTitle;
      }

      if (Platform.OS === 'ios') {
        if (excludedActivityTypes) {
          options.excludedActivityTypes = excludedActivityTypes;
        }
        if (tintColor) {
          options.tintColor = tintColor;
        }
      }

      const response = await Share.share(content, options);

      const shared = response?.action === Share.sharedAction;

      return { shared: !!shared, activityType: response?.activityType ?? undefined };
    } catch (error) {
      console.error('[APP] share error', error);
      throw { code: 'EUNAVAILABLE', message: '공유할 수 없습니다.' };
    }
  });
}
