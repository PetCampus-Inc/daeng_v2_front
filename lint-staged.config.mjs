import path from 'node:path';
import { ESLint } from 'eslint';

/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': 'prettier --write --ignore-unknown',

  '*.{ts,tsx,js,jsx}': async (files) => {
    try {
      // lint-staged는 Git 루트 기준 상대경로를 넘겨줌
      // -> 모바일 앱 파일 제외
      const onlyWeb = files.filter((f) => {
        const p = f.split(path.sep).join('/'); // 윈도/유닉스 호환
        // knockdog 웹 앱만 남기거나, mobile만 제외
        return p.startsWith('apps/knockdog/') && !p.includes('/node_modules/');
      });

      if (onlyWeb.length === 0) return [];

      const eslint = new ESLint({
        flags: ['v10_config_lookup_from_file'],
        fix: true,
        errorOnUnmatchedPattern: false,
        warnIgnored: false,
        // 모바일 폴더는 무시 (이중 안전장치)
        overrideConfig: {
          ignorePatterns: ['apps/mobile/**'],
        },
      });

      const results = await eslint.lintFiles(files);
      await ESLint.outputFixes(results);

      const hasErrors = results.some((result) => result.errorCount > 0);
      const hasWarnings = results.some((result) => result.warningCount > 0);

      if (hasErrors || hasWarnings) {
        const formatter = await eslint.loadFormatter('stylish');
        console.log(formatter.format(results));
        throw new Error('ESLint issues found');
      }

      return [];
    } catch (error) {
      if (error.messageTemplate === 'config-file-missing') {
        console.log('⏭️ ESLint skipped: No config found');
        return [];
      }

      throw error;
    }
  },
};
