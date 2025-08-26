import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import neostandard from 'neostandard';
import tseslint from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import { config as baseConfig } from './base.js';

export const config = [
  ...baseConfig,
  js.configs.recommended,
  ...neostandard({ noStyle: true }),
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    // eslint-plugin-react
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
    },
  },
];
