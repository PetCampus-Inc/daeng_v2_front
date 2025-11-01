// eslint.config.js (루트)
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  {
    ...expoConfig[0],
    settings: {
      'import/resolver': {
        typescript: {
          project: './apps/mobile/tsconfig.json',
        },
      },
    },
  },
  {
    ignores: ['dist', '**/node_modules/**'],
  },
]);
