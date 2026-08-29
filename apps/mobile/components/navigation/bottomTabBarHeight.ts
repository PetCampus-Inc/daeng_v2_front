import { Platform } from 'react-native';

const BOTTOM_TAB_BAR_DIM_HEIGHT = 64;
const ANDROID_TAB_BAR_CONTENT_HEIGHT = 64;
const ANDROID_TAB_BAR_MIN_BOTTOM_INSET = 12;

function getAndroidTabBarBottomInset(bottom: number) {
  return Math.max(bottom, ANDROID_TAB_BAR_MIN_BOTTOM_INSET);
}

/** 네이티브 바텀탭의 실제 전체 높이(콘텐츠 + 하단 세이프에어리어) */
function getBottomTabBarHeight(safeAreaBottomInset: number) {
  const bottomInset =
    Platform.OS === 'android' ? getAndroidTabBarBottomInset(safeAreaBottomInset) : safeAreaBottomInset;

  return BOTTOM_TAB_BAR_DIM_HEIGHT + bottomInset;
}

export {
  BOTTOM_TAB_BAR_DIM_HEIGHT,
  ANDROID_TAB_BAR_CONTENT_HEIGHT,
  ANDROID_TAB_BAR_MIN_BOTTOM_INSET,
  getAndroidTabBarBottomInset,
  getBottomTabBarHeight,
};
