import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerHomeQueryKey } from '../config/ownerHomeQueryKeys';
import { postHomeBannerDismiss } from './ownerHome';
import { syncWebViewQuery } from '@shared/lib/sync-webview-query';
const useHomeBannerDismiss = (userId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postHomeBannerDismiss,
    onSuccess: () => {
      const queryKey = ownerHomeQueryKey(userId);
      if (userId) syncWebViewQuery.invalidate([queryKey[0], userId]);
      return queryClient.invalidateQueries({ queryKey });
    },
  });
};
export { useHomeBannerDismiss };
