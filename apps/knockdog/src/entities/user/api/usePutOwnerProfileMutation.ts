'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

import { useUserStore } from '../model/store/useUserStore';
import { putOwnerProfile } from './user';
import {
  OWNER_MYPAGE_SUMMARY_QUERY_KEY,
  OWNER_PROFILE_QUERY_KEY,
  OWNER_ROLE_QUERY_KEY,
  ownerMypageSummaryQueryKey,
  ownerProfileQueryKey,
  ownerRoleQueryKey,
} from './useUserQuery';

function usePutOwnerProfileMutation() {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);

  return useMutation({
    mutationFn: putOwnerProfile,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerProfileQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: ownerMypageSummaryQueryKey(userId) }),
        queryClient.invalidateQueries({ queryKey: ownerRoleQueryKey(userId) }),
      ]);
      // 탭마다 독립된 WebView(=독립된 QueryClient)라 다른 탭에는 이 무효화가 전파 안 된다.
      // BroadcastChannel로 다른 탭에도 같이 알려준다.
      syncWebViewQuery.invalidate([OWNER_PROFILE_QUERY_KEY]);
      syncWebViewQuery.invalidate([OWNER_MYPAGE_SUMMARY_QUERY_KEY]);
      syncWebViewQuery.invalidate([OWNER_ROLE_QUERY_KEY]);
    },
  });
}

export { usePutOwnerProfileMutation };
