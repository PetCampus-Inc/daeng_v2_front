import { Platform, Share } from 'react-native';
import type { ShareParams } from '@knockdog/bridge-core';

function handleShare(event: string, payload: unknown): boolean {
  if (event !== 'system.share') return false;

  const params = (payload ?? {}) as ShareParams;
  const { message, url, subject, excludedActivityTypes, tintColor, title, dialogTitle } = params;

  if (!message && !url) {
    if (__DEV__) {
      console.warn('[Bridge] invalid share payload', payload);
    }
    return true;
  }

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

  Share.share(content, options).catch((error) => {
    console.error('[Bridge] share error', error);
  });

  return true;
}

export { handleShare };
