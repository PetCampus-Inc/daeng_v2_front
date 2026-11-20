import { Platform } from 'react-native';

const TAB_BAR_CONTENT_HEIGHT = 68;
const ANDROID_TAB_BAR_MIN_INSET = 12;

const getTabBarBottomInset = (bottom: number) =>
  Platform.OS === 'android' ? Math.max(bottom, ANDROID_TAB_BAR_MIN_INSET) : bottom;

/** 네이티브 바텀탭의 실제 전체 높이(콘텐츠 + 하단 세이프에어리어) */
const getBottomTabBarHeight = (safeAreaBottomInset: number) =>
  TAB_BAR_CONTENT_HEIGHT + getTabBarBottomInset(safeAreaBottomInset);

export { TAB_BAR_CONTENT_HEIGHT, getBottomTabBarHeight, getTabBarBottomInset };
