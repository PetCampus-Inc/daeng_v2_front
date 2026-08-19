import { api, type ApiResponse } from '@shared/api';

type PushPlatform = 'IOS' | 'ANDROID';

interface PushDeviceUpsertResponse {
  id?: number | string;
  pushDeviceId?: number | string;
}

interface UpsertPushDeviceParams {
  provider: 'FCM';
  platform: PushPlatform;
  token: string;
}

function toPushDeviceId(value: unknown): string | null {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === 'string' && value.trim()) return value;
  return null;
}

/** `PUT` - 로그인 사용자에게 현재 FCM 기기를 등록 또는 갱신한다. */
async function putPushDevice(params: UpsertPushDeviceParams): Promise<string | null> {
  const response = await api.put('push-devices', { json: params }).json<ApiResponse<PushDeviceUpsertResponse>>();
  return toPushDeviceId(response.data?.pushDeviceId) ?? toPushDeviceId(response.data?.id);
}

export { putPushDevice };
export type { PushPlatform };
