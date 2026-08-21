const { withPodfile } = require('@expo/config-plugins');

const marker = '# @generated begin react-native-firebase-disable-spm';
const block = `${marker}
# Firebase SPM products are linked separately by each RNFirebase pod when
# CocoaPods uses static frameworks, which causes duplicate symbols at link time.
$RNFirebaseDisableSPM = true
# @generated end react-native-firebase-disable-spm`;

/**
 * Uses CocoaPods for Firebase so static CocoaPods linkage does not duplicate
 * Firebase symbols across React Native Firebase pods.
 */
module.exports = function withRNFirebaseDisableSPM(config) {
  return withPodfile(config, (config) => {
    const hasMarker = config.modResults.contents.includes(marker);
    const hasBlock = config.modResults.contents.includes(block);

    if (hasMarker && !hasBlock) {
      throw new Error(
        'React Native Firebase CocoaPods 설정 블록이 Podfile에 불완전하게 남아 있습니다. 손상된 블록을 지우고 prebuild를 다시 실행해주세요.'
      );
    }

    if (!hasBlock) {
      const updatedContents = config.modResults.contents.replace(
        /(podfile_properties = .*\n)/,
        `$1\n${block}\n`
      );

      if (updatedContents === config.modResults.contents) {
        throw new Error('Podfile에 React Native Firebase CocoaPods 설정을 추가하지 못했습니다.');
      }

      config.modResults.contents = updatedContents;
    }

    return config;
  });
};
