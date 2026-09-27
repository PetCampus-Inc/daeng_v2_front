import { api, type ApiResponse } from '@shared/api';

interface PushSetting {
  pushEnabled: boolean;
  guardianPushEnabled: boolean;
  ownerPushEnabled: boolean;
}

const getPushSetting = async () => {
  return await api.get('notification-settings').json<ApiResponse<PushSetting>>();
};

const putPushSetting = async (request: PushSetting) => {
  return await api
    .put('notification-settings', {
      json: {
        pushEnabled: request.pushEnabled,
        guardianPushEnabled: request.guardianPushEnabled,
        ownerPushEnabled: request.ownerPushEnabled,
      },
    })
    .json<ApiResponse<PushSetting>>();
};

export { type PushSetting, getPushSetting, putPushSetting };
