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

  // Android React Native Share는 url 필드를 전달하지 않고 message만 공유한다.
  // URL을 한 번만 포함한 본문을 만들고, iOS에서는 URL을 별도 공유 항목으로 유지한다.
  const shareMessage = Platform.OS === 'android' && url ? [message, url].filter(Boolean).join('\n') : message || url || '';

  const content: { message: string; url?: string; title?: string } = {
    message: shareMessage,
  };

  // React Native의 url 공유는 iOS에서만 지원한다.
  if (Platform.OS === 'ios' && url) {
    content.url = url;
  }

  // Android 제목 설정
  if (Platform.OS === 'android' && title) {
    content.title = title;
  }

  // 플랫폼별 옵션 설정
  const options: {
    subject?: string;
    dialogTitle?: string;
    excludedActivityTypes?: string[];
    tintColor?: string;
  } = {};

  if (Platform.OS === 'android' && dialogTitle) {
    options.dialogTitle = dialogTitle;
  }

  if (Platform.OS === 'ios') {
    if (subject) {
      options.subject = subject;
    }
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
