const { withPodfile } = require('expo/config-plugins');

const marker = '# @generated begin react-native-firebase-modular-headers';
const endMarker = '# @generated end react-native-firebase-modular-headers';
const block = `${marker}
# Firebase Swift pods used as static libraries need module maps for these dependencies.
pod 'GoogleUtilities', :modular_headers => true
pod 'RecaptchaInterop', :modular_headers => true
${endMarker}`;

/**
 * Enables modular headers only for Firebase dependencies that CocoaPods reports
 * as missing module maps when RNFirebase is integrated as static libraries.
 */
module.exports = function withRNFirebaseModularHeaders(config) {
  return withPodfile(config, (config) => {
    const hasMarker = config.modResults.contents.includes(marker);
    const hasEndMarker = config.modResults.contents.includes(endMarker);

    if (hasMarker && !hasEndMarker) {
      throw new Error(
        'React Native Firebase modular headers 설정 블록이 Podfile에 불완전하게 남아 있습니다. 손상된 블록을 지우고 prebuild를 다시 실행해주세요.'
      );
    }

    if (!hasMarker) {
      const indentedBlock = block
        .split('\n')
        .map((line) => `  ${line}`)
        .join('\n');

      const updatedContents = config.modResults.contents.replace(
        /(target 'app' do\n\s+use_expo_modules!\n)/,
        `$1\n${indentedBlock}\n`
      );

      if (updatedContents === config.modResults.contents) {
        throw new Error('Podfile에 React Native Firebase modular headers 설정을 추가하지 못했습니다.');
      }

      config.modResults.contents = updatedContents;
    }

    return config;
  });
};
