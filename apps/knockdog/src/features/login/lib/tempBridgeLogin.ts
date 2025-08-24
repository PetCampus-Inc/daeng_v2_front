import { SocialProvider } from '@entities/social';

interface TempBridgeLoginResponse {
  idToken: string;
  name?: string;
  picture?: string;
}

export const tempBridgeLogin = async (provider: SocialProvider): Promise<TempBridgeLoginResponse> => {
  const message = JSON.stringify({ type: 'LOGIN', payload: { provider } });

  if (typeof window !== 'undefined') {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(message);
    } else {
      throw new Error('WebView 환경에서만 사용할 수 있습니다.');
    }
  }

  return new Promise((resolve, _reject) => {
    const messageHandler = (event: MessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        if (type === 'LOGIN_RESPONSE') {
          window.removeEventListener('message', messageHandler);
          resolve(payload as TempBridgeLoginResponse);
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    window.addEventListener('message', messageHandler);
  });
};
