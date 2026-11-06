import { useQuery } from '@tanstack/react-query';
import { getUserInfo, getOwnerRole, getOwnerMypageSummary, getOwnerProfile } from './user';

const USER_INFO_QUERY_KEY = 'userInfo';

/** 계정 전환 시 이전 사용자의 개인정보 캐시가 재사용되지 않도록 분리한다. */
const userInfoQueryKey = (userId?: string) => [USER_INFO_QUERY_KEY, userId] as const;

const useUserInfoQuery = (userId?: string) => {
  return useQuery({
    queryKey: userInfoQueryKey(userId),
    queryFn: getUserInfo,
    select: (data) => data.data,
    enabled: Boolean(userId),
  });
};

const OWNER_ROLE_QUERY_KEY = 'ownerRole';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 상태가 남지 않도록 함 */
const ownerRoleQueryKey = (userId?: string) => [OWNER_ROLE_QUERY_KEY, userId] as const;

/**
 * 네이티브는 탭마다 WebView가 있어 visibility/focus가 동시에 여러 인스턴스에서 발생한다.
 * 그때 owner/role을 전부 refetch하면 탭별 isOwner settle 타이밍이 어긋나 모드가 핑퐁한다.
 * 활성 탭 재조회는 useOwnerRole의 native-tab-focus / appresume에서만 수행한다.
 */
function shouldRefetchOwnerQueriesOnWindowFocus() {
  if (typeof window === 'undefined') return true;
  return !(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView;
}

interface UseOwnerRoleQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const useOwnerRoleQuery = ({ userId, enabled = true }: UseOwnerRoleQueryOptions = {}) => {
  const refetchOnWindowFocus = shouldRefetchOwnerQueriesOnWindowFocus();

  return useQuery({
    queryKey: ownerRoleQueryKey(userId),
    queryFn: getOwnerRole,
    select: (data) => data.data,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus,
    refetchOnReconnect: refetchOnWindowFocus,
  });
};

const OWNER_MYPAGE_SUMMARY_QUERY_KEY = 'ownerMypageSummary';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 요약이 남지 않도록 함 */
const ownerMypageSummaryQueryKey = (userId?: string) =>
  [OWNER_MYPAGE_SUMMARY_QUERY_KEY, userId] as const;

interface UseOwnerMypageSummaryQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const useOwnerMypageSummaryQuery = ({
  userId,
  enabled = true,
}: UseOwnerMypageSummaryQueryOptions = {}) => {
  const refetchOnWindowFocus = shouldRefetchOwnerQueriesOnWindowFocus();

  return useQuery({
    queryKey: ownerMypageSummaryQueryKey(userId),
    queryFn: getOwnerMypageSummary,
    select: (data) => data.data,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus,
    refetchOnReconnect: refetchOnWindowFocus,
  });
};

const OWNER_PROFILE_QUERY_KEY = 'ownerProfile';

/** 유저별로 캐시를 분리해 계정 전환 시 이전 원장 프로필이 남지 않도록 함 */
const ownerProfileQueryKey = (userId?: string) => [OWNER_PROFILE_QUERY_KEY, userId] as const;

interface UseOwnerProfileQueryOptions {
  userId?: string;
  enabled?: boolean;
}

const useOwnerProfileQuery = ({ userId, enabled = true }: UseOwnerProfileQueryOptions = {}) => {
  const refetchOnWindowFocus = shouldRefetchOwnerQueriesOnWindowFocus();

  return useQuery({
    queryKey: ownerProfileQueryKey(userId),
    queryFn: getOwnerProfile,
    select: (data) => data.data,
    enabled,
    staleTime: 0,
    refetchOnWindowFocus,
    refetchOnReconnect: refetchOnWindowFocus,
  });
};

export {
  useUserInfoQuery,
  USER_INFO_QUERY_KEY,
  userInfoQueryKey,
  useOwnerRoleQuery,
  OWNER_ROLE_QUERY_KEY,
  ownerRoleQueryKey,
  useOwnerMypageSummaryQuery,
  OWNER_MYPAGE_SUMMARY_QUERY_KEY,
  ownerMypageSummaryQueryKey,
  useOwnerProfileQuery,
  OWNER_PROFILE_QUERY_KEY,
  ownerProfileQueryKey,
};
