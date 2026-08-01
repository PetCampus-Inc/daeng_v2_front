import { useMemo } from 'react';
import { LinkingOptions, PartialState, NavigationState } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '@/types/navigation';

const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://app.knockdog.net';

// 탭 경로 매핑
type TabScreen = NonNullable<RootStackParamList['Tabs']>['screen'];

const TAB_PATHS: Record<string, TabScreen> = {
  '': 'Explore',
  save: 'Save',
  compare: 'Compare',
  mypage: 'Mypage',
  owner: 'OwnerHome',
  'owner/daily': 'OwnerDaily',
  'owner/album': 'OwnerAlbum',
  'owner/members': 'OwnerMembers',
};

function useLinking(): LinkingOptions<RootStackParamList> {
  return useMemo(
    () => ({
      prefixes: [Linking.createURL('/'), 'daengv2mobile://', WEBVIEW_URL],
      getStateFromPath: (path: string): PartialState<NavigationState<RootStackParamList>> => {
        // [Android] Expo Dev Client가 앱 시작 시 전달하는 특수 경로 필터링
        if (__DEV__ && path.startsWith('expo-development-client')) {
          return {
            routes: [{ name: 'Tabs', state: { routes: [{ name: 'Explore' }] } }],
          };
        }

        const normalizedPath = path.replace(/^\/+/, '');

        // 탭 경로인 경우
        const tabScreen = TAB_PATHS[normalizedPath];
        if (tabScreen) {
          return {
            routes: [{ name: 'Tabs', state: { routes: [{ name: tabScreen }] } }],
          };
        }

        // 그 외 모든 경로는 Stack 스크린으로 라우팅
        // 예) daengv2mobile://kindergarten/123
        //     → path = "kindergarten/123"
        //     → fullUrl = "https://app.knockdog.net/kindergarten/123"
        const fullUrl = path.startsWith('http') ? path : `${WEBVIEW_URL}/${normalizedPath}`;

        return {
          routes: [
            // 홈(Tabs)을 스택에 먼저 추가하여 뒤로가기 시 홈으로 돌아갈 수 있게 함
            { name: 'Tabs', state: { routes: [{ name: 'Explore' }] } },
            { name: 'Stack', params: { path: fullUrl } },
          ],
        };
      },
    }),
    []
  );
}

export { useLinking };
