const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * targetSdk 35+/36에서 predictive back이 켜지면 KEYCODE_BACK /
 * onBackPressed가 JS BackHandler까지 안 오고 Activity가 바로 finish 된다.
 * RN BackHandler가 먹히도록 legacy back dispatch로 되돌린다.
 *
 * @see https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture
 */
function withDisableAndroidPredictiveBack(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;

    application.$ = application.$ ?? {};
    application.$['android:enableOnBackInvokedCallback'] = 'false';

    const activities = application.activity ?? [];
    for (const activity of activities) {
      if (activity?.$?.['android:name'] === '.MainActivity') {
        activity.$['android:enableOnBackInvokedCallback'] = 'false';
      }
    }

    return config;
  });
}

module.exports = withDisableAndroidPredictiveBack;
