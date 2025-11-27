import { api } from '@shared/api';

interface PushSetting {
  app_push: boolean;
  mkt_consent: boolean;
  mkt_push: boolean;
  mkt_email: boolean;
}

const getPushSetting = async () => {
  return await api.get(`mypage/getPushSetting`).json<PushSetting>();
};

const postPushSetting = async (request: PushSetting) => {
  return await api.post(`mypage/updatePushSetting`, { json: request }).json<PushSetting>();
};

export { type PushSetting, getPushSetting, postPushSetting };
