import { api, type ApiResponse } from '@shared/api';

interface PushSetting {
  pushEnabled: boolean;
}

const getPushSetting = async () => {
  return await api.get('notification-settings').json<ApiResponse<PushSetting>>();
};

const putPushSetting = async (request: PushSetting) => {
  return await api.put('notification-settings', { json: request });
};

export { type PushSetting, getPushSetting, putPushSetting };
