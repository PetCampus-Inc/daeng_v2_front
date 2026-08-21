// @TODO 외부 영향 줄 수 있는 변경은 피하기 (이후에 진행)

const METHODS = {
  // device
  getLatLng: 'device.getLatLng',
  getSafeAreaInsets: 'device.getSafeAreaInsets',
  getCurrentLocation: 'device.getCurrentLocation',
  getLocationPermission: 'device.getLocationPermission',
  requestLocationPermission: 'device.requestLocationPermission',
  isLocationServiceEnabled: 'device.isLocationServiceEnabled',
  getLastKnownLocation: 'device.getLastKnownLocation',
  requestCameraPermission: 'device.requestCameraPermission',
  requestPhotosPermission: 'device.requestPhotosPermission',
  getNotificationPermission: 'device.getNotificationPermission',
  requestNotificationPermission: 'device.requestNotificationPermission',

  // system
  callPhone: 'system.callPhone',
  copyToClipboard: 'system.copyToClipboard',
  share: 'system.share',
  openExternalLink: 'system.openExternalLink',
  openSettings: 'system.openSettings',
  getAppVersion: 'system.getAppVersion',

  // navigation
  navPush: 'system.navPush',
  navBack: 'system.navBack',
  navReset: 'system.navReset',
  navReplace: 'system.navReplace',
  navSwitchTab: 'system.navSwitchTab',
  navSetMainTabMode: 'system.navSetMainTabMode',
  navSetBottomTabBarVisible: 'system.navSetBottomTabBarVisible',

  // external
  naverOpenRoute: 'naver.openRoute',

  // toast
  toastShow: 'toast.show',
  toastDismiss: 'toast.dismiss',
  toastClear: 'toast.clear',

  // media
  saveImageToGallery: 'media.saveImageToGallery',
  putFileToPresignedUrl: 'media.putFileToPresignedUrl',

  // auth
  kakaoLogin: 'auth.kakaoLogin',
  googleLogin: 'auth.googleLogin',
  appleLogin: 'auth.appleLogin',
} as const;

type MethodName = (typeof METHODS)[keyof typeof METHODS];

export type { MethodName };
export { METHODS };
