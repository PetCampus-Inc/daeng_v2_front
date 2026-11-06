interface PushEventMap {
  /** WebView 인증 세션 복원이 끝났음을 native에 알린다. */
  'push.sessionReady': undefined;
  /** Native가 현재 FCM registration token을 인증된 WebView에 전달한다. */
  'push.fcmToken': { token: string; platform: 'IOS' | 'ANDROID' };
}

export type { PushEventMap };
