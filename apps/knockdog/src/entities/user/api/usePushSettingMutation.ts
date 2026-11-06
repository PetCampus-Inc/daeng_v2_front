import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putPushSetting, type PushSetting } from './pushSetting';
import { PUSH_SETTING_QUERY_KEY } from './usePushSettingQuery';

const usePushSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PushSetting) => putPushSetting(request),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: PUSH_SETTING_QUERY_KEY });
      const previous = queryClient.getQueryData<PushSetting>(PUSH_SETTING_QUERY_KEY);
      queryClient.setQueryData(PUSH_SETTING_QUERY_KEY, request);
      return { previous };
    },
    onError: (_error, _request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PUSH_SETTING_QUERY_KEY, context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUSH_SETTING_QUERY_KEY });
    },
  });
};

export { usePushSettingMutation };
