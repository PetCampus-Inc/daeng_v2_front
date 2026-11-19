import { Platform } from 'react-native';

const ANDROID_TAB_BAR_CONTENT_HEIGHT = 64;
const IOS_TAB_BAR_CONTENT_HEIGHT = 49;
const GUARDIAN_TAB_BAR_CONTENT_HEIGHT = 68;
const ANDROID_TAB_BAR_MIN_BOTTOM_INSET = 12;

function getAndroidTabBarBottomInset(bottom: number) {
  return Math.max(bottom, ANDROID_TAB_BAR_MIN_BOTTOM_INSET);
}

/** 네이티브 바텀탭의 실제 전체 높이(콘텐츠 + 하단 세이프에어리어) */
const getBottomTabBarHeight = (safeAreaBottomInset: number, isOwnerMode: boolean) => {
  const isAndroid = Platform.OS === 'android';
  const bottomInset = isAndroid ? getAndroidTabBarBottomInset(safeAreaBottomInset) : safeAreaBottomInset;
  const ownerHeight = isAndroid ? ANDROID_TAB_BAR_CONTENT_HEIGHT : IOS_TAB_BAR_CONTENT_HEIGHT;
  return (isOwnerMode ? ownerHeight : GUARDIAN_TAB_BAR_CONTENT_HEIGHT) + bottomInset;
};

export {
  ANDROID_TAB_BAR_CONTENT_HEIGHT,
  IOS_TAB_BAR_CONTENT_HEIGHT,
  ANDROID_TAB_BAR_MIN_BOTTOM_INSET,
  getAndroidTabBarBottomInset,
  getBottomTabBarHeight,
};
