import GuardianArchiveIcon from '@/assets/icons/guardian_archive.svg';
import GuardianLogIcon from '@/assets/icons/guardian_log.svg';
import GuardianMapIcon from '@/assets/icons/guardian_map.svg';
import GuardianMyIcon from '@/assets/icons/guardian_my.svg';
import GuardianReserveIcon from '@/assets/icons/guardian_reserve.svg';
import OwnerAlbumIcon from '@/assets/icons/owner_album.svg';
import OwnerDailyIcon from '@/assets/icons/owner_daily.svg';
import OwnerHomeIcon from '@/assets/icons/owner_home.svg';
import OwnerMembersIcon from '@/assets/icons/owner_members.svg';
import OwnerMypageIcon from '@/assets/icons/owner_mypage.svg';
import { useMainTabModeStore } from '@/bridges/model/mainTabModeStore';
import { useBottomTabBarVisibilityStore } from '@/bridges/model/bottomTabBarVisibilityStore';
import { tabWebViewStore } from '@/bridges/model/tabWebViewStore';
import type { TabName } from '@/bridges/lib/tabRoutes';
import ExploreTab from '@/screens/explore';
import KindergartenTab from '@/screens/kindergarten';
import ReservationTab from '@/screens/reservation';
import MypageTab from '@/screens/mypage';
import OwnerAlbumTab from '@/screens/owner-album';
import OwnerDailyTab from '@/screens/owner-daily';
import OwnerHomeTab from '@/screens/owner-home';
import OwnerMembersTab from '@/screens/owner-members';
import SaveTab from '@/screens/save';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAndroidTabBack } from './useAndroidTabBack';
import {
  BOTTOM_TAB_BAR_DIM_HEIGHT,
  ANDROID_TAB_BAR_CONTENT_HEIGHT,
  getAndroidTabBarBottomInset,
} from './bottomTabBarHeight';

const Tab = createBottomTabNavigator();

const OWNER_TAB_NAMES = new Set(['OwnerHome', 'OwnerDaily', 'OwnerAlbum', 'OwnerMembers']);
const GUARDIAN_TAB_NAMES = new Set(['Explore', 'Save', 'Reserve', 'Kindergarten']);

function getTabBarStyle(isTabBarVisible: boolean, bottom: number) {
  if (!isTabBarVisible) {
    return { display: 'none' as const };
  }

  if (Platform.OS === 'android') {
    const tabBarBottomInset = getAndroidTabBarBottomInset(bottom);

    return {
      height: ANDROID_TAB_BAR_CONTENT_HEIGHT + tabBarBottomInset,
      paddingBottom: tabBarBottomInset,
      paddingTop: 6,
      paddingLeft: 12,
      paddingRight: 12,
    };
  }

  return {
    paddingBottom: bottom,
    paddingLeft: 12,
    paddingRight: 12,
  };
}

/** v7: tabBarButton null만으론 flex 공간이 남아 탭이 한쪽으로 쏠림 */
const HIDDEN_TAB_OPTIONS = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' as const },
};

function isTabVisible(routeName: string, isOwnerMode: boolean) {
  if (routeName === 'Mypage') return true;
  if (OWNER_TAB_NAMES.has(routeName)) return isOwnerMode;
  if (GUARDIAN_TAB_NAMES.has(routeName)) return !isOwnerMode;
  return true;
}

function notifyCurrentTabWillBlur(tabName: TabName) {
  tabWebViewStore
    .get(tabName)
    ?.current?.injectJavaScript(
      `(function(){window.dispatchEvent(new CustomEvent('knockdog:native-tab-will-blur'));})();true;`
    );
}

export default function TabNavigator() {
  const { bottom } = useSafeAreaInsets();
  const androidTabBarBottomInset = getAndroidTabBarBottomInset(bottom);
  const mode = useMainTabModeStore((state) => state.mode);
  const isOwnerMode = mode === 'owner';
  const isTabBarVisible = useBottomTabBarVisibilityStore((state) => state.visible);
  const isBottomTabBarDimmed = useBottomTabBarVisibilityStore((state) => state.dimmed);

  useAndroidTabBack();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenListeners={({ navigation }) => ({
          // blur는 화면 전환 후 발생한다. 그 전에 WebView 오버레이를 즉시 제거해
          // Android에서 이전 탭의 닫힘 애니메이션이 보이지 않게 한다.
          tabPress: (event) => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index ?? 0];

            if (!currentRoute || currentRoute.key === event.target) return;
            notifyCurrentTabWillBlur(currentRoute.name as TabName);
          },
        })}
        screenOptions={({ route }) => {
          const visible = isTabVisible(route.name, isOwnerMode);

          return {
            tabBarIcon: ({ focused }) => {
              const tint = focused ? '#FF6E0C' : isOwnerMode ? '#B4B4BB' : '#8C8C94';
              const strokeIconProps = { color: tint };

              switch (route.name) {
                case 'Explore':
                  return (
                    <GuardianMapIcon width={22} height={22} color={focused ? '#FF6E0C' : '#B4B4BB'} />
                  );
                case 'Save':
                  return (
                    <GuardianArchiveIcon width={21} height={21} color={focused ? '#FF6E0C' : '#B4B4BB'} />
                  );
                case 'Reserve':
                  return (
                    <GuardianReserveIcon
                      width={20}
                      height={20}
                      color={focused ? '#FF6E0C' : '#B4B4BB'}
                    />
                  );
                case 'Kindergarten':
                  return (
                    <GuardianLogIcon width={23} height={20} color={focused ? '#FF6E0C' : '#B4B4BB'} />
                  );
                case 'OwnerHome':
                  return <OwnerHomeIcon width={21} height={21} {...strokeIconProps} />;
                case 'OwnerDaily':
                  return <OwnerDailyIcon width={20} height={20} {...strokeIconProps} />;
                case 'OwnerAlbum':
                  return <OwnerAlbumIcon width={20} height={20} {...strokeIconProps} />;
                case 'OwnerMembers':
                  return <OwnerMembersIcon width={21} height={21} {...strokeIconProps} />;
                case 'Mypage':
                  return isOwnerMode ? (
                    <OwnerMypageIcon width={21} height={21} {...strokeIconProps} />
                  ) : (
                    <GuardianMyIcon width={21} height={21} color={focused ? '#FF6E0C' : '#B4B4BB'} />
                  );
                default:
                  console.warn('❗ tabBarIcon: Unknown route name', route.name);
                  return null;
              }
            },
            tabBarActiveTintColor: '#FF6E0C',
            tabBarInactiveTintColor: '#8C8C94',
            ...(Platform.OS === 'android' ? { tabBarAllowFontScaling: false } : {}),
            tabBarStyle: getTabBarStyle(isTabBarVisible, bottom),
            tabBarLabelStyle: {
              fontSize: 12,
              marginTop: 2,
              ...(isOwnerMode
                ? {
                    fontFamily: 'SUIT-SemiBold',
                    lineHeight: 18,
                    letterSpacing: -0.24,
                    marginTop: 4,
                  }
                : {}),
            },
            headerShown: false,
            ...(visible ? {} : HIDDEN_TAB_OPTIONS),
          };
        }}
      >
        <Tab.Screen name='Explore' component={ExploreTab} options={{ title: '내 주변' }} />
        <Tab.Screen name='Save' component={SaveTab} options={{ title: '보관함' }} />
        <Tab.Screen name='Reserve' component={ReservationTab} options={{ title: '예약' }} />
        <Tab.Screen name='Kindergarten' component={KindergartenTab} options={{ title: '똑독로그' }} />
        <Tab.Screen name='OwnerHome' component={OwnerHomeTab} options={{ title: '홈' }} />
        <Tab.Screen name='OwnerDaily' component={OwnerDailyTab} options={{ title: '일과' }} />
        <Tab.Screen name='OwnerAlbum' component={OwnerAlbumTab} options={{ title: '앨범' }} />
        <Tab.Screen name='OwnerMembers' component={OwnerMembersTab} options={{ title: '구성원' }} />
        <Tab.Screen name='Mypage' component={MypageTab} options={{ title: '마이' }} />
      </Tab.Navigator>
      {isTabBarVisible && isBottomTabBarDimmed ? (
        <View
          pointerEvents='auto'
          style={[
            styles.bottomTabBarDim,
            {
              height:
                BOTTOM_TAB_BAR_DIM_HEIGHT +
                (Platform.OS === 'android' ? androidTabBarBottomInset : bottom),
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomTabBarDim: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    elevation: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
