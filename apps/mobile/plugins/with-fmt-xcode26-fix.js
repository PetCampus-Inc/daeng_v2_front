const { withDangerousMod } = require('expo/config-plugins');
const fs = require('node:fs');
const path = require('node:path');

// Xcode 26's Apple Clang rejects fmt 11's consteval macro expansion.
const withFmtXcode26Fix = (config) =>
  withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      const marker = '# Xcode 26 fmt consteval workaround';
      let podfile = fs.readFileSync(podfilePath, 'utf8');
      if (podfile.includes(marker)) return config;

      const anchor = '    # This is necessary for Xcode 14, because it signs resource bundles by default';
      if (!podfile.includes(anchor)) {
        throw new Error('Unable to apply the Xcode 26 fmt workaround: Podfile layout changed.');
      }

      const patch = `
    ${marker}
    fmt_base = File.join(installer.sandbox.pod_dir('fmt'), 'include', 'fmt', 'base.h')
    if File.exist?(fmt_base)
      content = File.read(fmt_base)
      patched = content.gsub(/^#  define FMT_USE_CONSTEVAL 1$/, '#  define FMT_USE_CONSTEVAL 0')
      if patched != content
        File.chmod(0644, fmt_base)
        File.write(fmt_base, patched)
      end
    end
`;
      fs.writeFileSync(podfilePath, podfile.replace(anchor, `${patch}\n${anchor}`));
      return config;
    },
  ]);

module.exports = withFmtXcode26Fix;
