import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postPushSetting, type PushSetting } from './pushSetting';

const usePushSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PushSetting) => postPushSetting(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pushSetting'] });
    },
  });
};

export { usePushSettingMutation };
