import { useQuery } from '@tanstack/react-query';
import { getPushSetting } from './pushSetting';

const usePushSettingQuery = () => {
  return useQuery({
    queryKey: ['pushSetting'],
    queryFn: getPushSetting,
  });
};

export { usePushSettingQuery };
