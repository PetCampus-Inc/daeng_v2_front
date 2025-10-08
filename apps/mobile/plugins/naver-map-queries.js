const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Android에 nmap 스킴 쿼리를 추가하는 Expo Config Plugin
 * AndroidManifest.xml의 <queries> 섹션에 네이버 지도 앱 intent를 추가합니다.
 */
const withNaverMapQueries = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // <manifest> 루트 요소 가져오기
    const mainApplication = androidManifest.manifest;

    // <queries> 요소 찾기 또는 생성
    let queriesElement = mainApplication.queries?.[0];
    if (!queriesElement) {
      if (!mainApplication.queries) {
        mainApplication.queries = [];
      }
      queriesElement = {};
      mainApplication.queries.push(queriesElement);
    }

    // <intent> 요소 추가
    if (!queriesElement.intent) {
      queriesElement.intent = [];
    }

    // 네이버 지도 intent가 이미 있는지 확인
    const hasNaverMapIntent = queriesElement.intent.some((intent) => {
      return (
        intent.data?.[0]?.$?.['android:scheme'] === 'nmap' &&
        intent.action?.[0]?.$?.['android:name'] === 'android.intent.action.VIEW'
      );
    });

    // 없으면 추가
    if (!hasNaverMapIntent) {
      queriesElement.intent.push({
        action: [
          {
            $: {
              'android:name': 'android.intent.action.VIEW',
            },
          },
        ],
        data: [
          {
            $: {
              'android:scheme': 'nmap',
            },
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withNaverMapQueries;
