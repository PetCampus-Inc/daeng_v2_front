const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * 앱 삭제 후 재설치 시 WebView localStorage/쿠키가 Auto Backup으로
 * 복원되어 미로그인인데 홈으로 들어가는 문제를 막는다.
 */
function withDisableAndroidBackup(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;

    application.$ = application.$ ?? {};
    application.$['android:allowBackup'] = 'false';
    application.$['android:fullBackupContent'] = 'false';
    // attribute만 끄면 일부 기기에서 무시될 수 있어 명시
    delete application.$['android:dataExtractionRules'];

    return config;
  });
}

module.exports = withDisableAndroidBackup;
