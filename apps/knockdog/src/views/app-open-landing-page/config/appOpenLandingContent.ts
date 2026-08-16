const APP_OPEN_STORE_URLS = {
  ios: 'https://apps.apple.com/kr/app/knockdog/id6754978978',
  android: 'https://play.google.com/store/apps/details?id=net.knockdog.petcampus.v2',
} as const;

/** 설치 시 보호자 홈(Explore)으로 진입 */
const APP_OPEN_NATIVE_SCHEME = 'daengv2mobile://';

const APP_OPEN_WEB_HOME_URL = 'https://home.knockdog.net/';

/** 앱 미오픈으로 판단 후 스토어로 보내는 대기 시간 */
const APP_OPEN_STORE_FALLBACK_MS = 1200;

export {
  APP_OPEN_NATIVE_SCHEME,
  APP_OPEN_STORE_FALLBACK_MS,
  APP_OPEN_STORE_URLS,
  APP_OPEN_WEB_HOME_URL,
};
