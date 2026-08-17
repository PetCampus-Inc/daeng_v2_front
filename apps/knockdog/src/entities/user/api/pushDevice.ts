import { api } from '@shared/api';

interface PushDeviceRegistrationRequest {
  provider: 'FCM';
  platform: 'ANDROID' | 'IOS';
  token: string;
  supportedProvider: boolean;
}

/** `PUT /api/v0/push-devices` — 현재 로그인 유저에 기기 토큰 등록/갱신 */
function putPushDevice(request: PushDeviceRegistrationRequest) {
  return api.put('push-devices', { json: request }).json();
}

export { putPushDevice };
export type { PushDeviceRegistrationRequest };
