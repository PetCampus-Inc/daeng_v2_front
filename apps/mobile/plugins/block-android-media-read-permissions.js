const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');

/** Google Play 사진/동영상 정책: READ_MEDIA_* 는 시스템 Photo Picker로 대체 */
const READ_MEDIA_PERMISSIONS = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
];

function withBlockAndroidMediaReadPermissions(config) {
  config = AndroidConfig.Permissions.withBlockedPermissions(config, READ_MEDIA_PERMISSIONS);

  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;

    if (!manifest.manifest.$) {
      manifest.manifest.$ = {};
    }
    manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    const permissions = manifest.manifest['uses-permission'] ?? [];

    for (const permission of READ_MEDIA_PERMISSIONS) {
      permissions.push({
        $: {
          'android:name': permission,
          'tools:node': 'remove',
        },
      });
    }

    manifest.manifest['uses-permission'] = permissions;
    return config;
  });
}

module.exports = withBlockAndroidMediaReadPermissions;
