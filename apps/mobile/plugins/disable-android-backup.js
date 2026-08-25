const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const DATA_EXTRACTION_RULES_XML = `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <exclude domain="root" path="." />
        <exclude domain="file" path="." />
        <exclude domain="database" path="." />
        <exclude domain="sharedpref" path="." />
        <exclude domain="external" path="." />
    </cloud-backup>
    <device-transfer>
        <exclude domain="root" path="." />
        <exclude domain="file" path="." />
        <exclude domain="database" path="." />
        <exclude domain="sharedpref" path="." />
        <exclude domain="external" path="." />
    </device-transfer>
</data-extraction-rules>
`;

/**
 * 앱 삭제 후 재설치·기기 전송 시 WebView localStorage/쿠키가 복원되어
 * 미로그인인데 홈으로 들어가는 문제를 막는다.
 */
function withDisableAndroidBackup(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const xmlDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(path.join(xmlDir, 'data_extraction_rules.xml'), DATA_EXTRACTION_RULES_XML, 'utf8');
      return config;
    },
  ]);

  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;

    application.$ = application.$ ?? {};
    application.$['android:allowBackup'] = 'false';
    application.$['android:fullBackupContent'] = 'false';
    application.$['android:dataExtractionRules'] = '@xml/data_extraction_rules';

    return config;
  });
}

module.exports = withDisableAndroidBackup;
