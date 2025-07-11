import { ESLint } from 'eslint';

/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*': 'prettier --write --ignore-unknown',
  '*.{ts,tsx,js,jsx}': async (files) => {
    try {
      const eslint = new ESLint({
        flags: ['v10_config_lookup_from_file'],
        fix: true,
        errorOnUnmatchedPattern: false,
        warnIgnored: false,
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
