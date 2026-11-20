import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

import { putReservationSetting } from './putReservationSetting';
import { reservationSettingQueryKeys } from '../config/reservationSettingQueryKeys';

const usePutReservationMutation = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    // 오프라인 저장을 재연결까지 보류하지 않고 실패로 알려 재시도할 수 있게 한다.
    networkMode: 'always',
    mutationFn: putReservationSetting,
    onSuccess: async () => {
      if (!userId) {
        await queryClient.invalidateQueries({ queryKey: reservationSettingQueryKeys.all });
        syncWebViewQuery.invalidate(reservationSettingQueryKeys.all);
        return;
      }

      const queryKey = reservationSettingQueryKeys.byUser(userId);
      await queryClient.invalidateQueries({ queryKey });
      syncWebViewQuery.invalidate(queryKey);
    },
  });
};

export { usePutReservationMutation };
