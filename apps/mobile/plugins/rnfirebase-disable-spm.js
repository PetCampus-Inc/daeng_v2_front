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
    if (!config.modResults.contents.includes(marker)) {
      const updatedContents = config.modResults.contents.replace(
        /(podfile_properties = .*\n)/,
        `$1\n${block}\n`
      );

      if (updatedContents === config.modResults.contents) {
        throw new Error('Unable to add the React Native Firebase CocoaPods configuration to the Podfile.');
      }

      config.modResults.contents = updatedContents;
    }

    return config;
  });
};
