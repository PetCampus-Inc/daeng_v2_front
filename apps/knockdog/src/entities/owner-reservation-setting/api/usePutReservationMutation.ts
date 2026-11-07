import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

import { putReservationSetting } from './putReservationSetting';
import { reservationSettingQueryKeys } from '../config/reservationSettingQueryKeys';

const usePutReservationMutation = (userId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
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
