import { Platform } from 'react-native';

const BOTTOM_TAB_BAR_DIM_HEIGHT = 64;
const ANDROID_TAB_BAR_CONTENT_HEIGHT = 64;
const IOS_TAB_BAR_CONTENT_HEIGHT = 49;
const ANDROID_TAB_BAR_MIN_BOTTOM_INSET = 12;

function getAndroidTabBarBottomInset(bottom: number) {
  return Math.max(bottom, ANDROID_TAB_BAR_MIN_BOTTOM_INSET);
}

/** 네이티브 바텀탭의 실제 전체 높이(콘텐츠 + 하단 세이프에어리어) */
function getBottomTabBarHeight(safeAreaBottomInset: number) {
  if (Platform.OS === 'android') {
    return ANDROID_TAB_BAR_CONTENT_HEIGHT + getAndroidTabBarBottomInset(safeAreaBottomInset);
  }

  return IOS_TAB_BAR_CONTENT_HEIGHT + safeAreaBottomInset;
}

export {
  BOTTOM_TAB_BAR_DIM_HEIGHT,
  ANDROID_TAB_BAR_CONTENT_HEIGHT,
  IOS_TAB_BAR_CONTENT_HEIGHT,
  ANDROID_TAB_BAR_MIN_BOTTOM_INSET,
  getAndroidTabBarBottomInset,
  getBottomTabBarHeight,
};
