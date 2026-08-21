import { useQuery } from '@tanstack/react-query';
import { getPushSetting } from './pushSetting';

const PUSH_SETTING_QUERY_KEY = ['pushSetting'] as const;

const usePushSettingQuery = () => {
  return useQuery({
    queryKey: PUSH_SETTING_QUERY_KEY,
    queryFn: async () => (await getPushSetting()).data,
  });
};

export { PUSH_SETTING_QUERY_KEY, usePushSettingQuery };
