const { withAndroidManifest } = require('expo/config-plugins');

const PORTRAIT_FEATURE = 'android.hardware.screen.portrait';

const withOptionalPortrait = (config) =>
  withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const features = manifest['uses-feature'] ?? [];

    manifest['uses-feature'] = [
      ...features.filter((feature) => feature.$['android:name'] !== PORTRAIT_FEATURE),
      { $: { 'android:name': PORTRAIT_FEATURE, 'android:required': 'false' } },
    ];

    return config;
  });

module.exports = withOptionalPortrait;
