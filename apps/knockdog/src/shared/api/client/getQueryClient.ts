import { MutationCache, QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';

import { NETWORK_ERROR_TOAST_MESSAGE, toast } from '@shared/ui/toast';
import { eventBus } from '@shared/utils';

import { isNetworkError } from '../lib/isNetworkError';

function makeQueryClient() {
  return new QueryClient({
    // 인터넷 연결 문제로 작업(등록·수정·삭제 등)이 실패하면 어느 화면이든 같은 문구로 알린다.
    // 화면별 실패 토스트가 덮어쓰지 않도록 우선 토스트로 띄운다.
    mutationCache: new MutationCache({
      onError: (error) => {
        if (isNetworkError(error)) toast.priority(NETWORK_ERROR_TOAST_MESSAGE);
      },
    }),
    defaultOptions: {
      queries: {
        // 기본값(`online`)은 오프라인일 때 요청을 보내지 않고 재연결까지 보류해 오류 없이 로딩만 계속된다.
        // 요청을 바로 보내 실패로 처리하고, 사용자가 직접 다시 시도하게 한다.
        networkMode: 'always',
        retry: 0,
        retryOnMount: false,
        staleTime: 60 * 1000,
      },
      mutations: {
        networkMode: 'always',
        retry: 0,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

// eslint-disable-next-line no-undef-init
let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

if (typeof window !== 'undefined') {
  eventBus.subscribe('auth:logout', () => {
    getQueryClient().clear();
  });
}
