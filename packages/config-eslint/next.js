import neostandard from 'neostandard';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import fsdPlugin from 'eslint-plugin-fsd-lint';
import { config as baseConfig } from './base.js';

export const nextJsConfig = [
  ...baseConfig,
  ...neostandard({ noStyle: true, ts: true }),
  {
    //  // eslint-plugin-react
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
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
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      // 'fsd/forbidden-imports': 'error',
      'fsd/no-cross-slice-dependency': 'error',
      'fsd/no-global-store-imports': 'error',
      'fsd/no-public-api-sidestep': [
        'error',
        {
          layers: ['@app', '@widgets', '@features', '@entities', '@shared'],
        },
      ],
      'fsd/no-relative-imports': [
        'error',
        {
          allowSameSlice: true,
        },
      ],
      'fsd/no-ui-in-business-logic': 'error',
      'fsd/ordered-imports': 'warn',
    },
  },
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'error',
      'no-debugger': 'error',
      curly: ['error', 'multi-line'],
      camelcase: ['error', { properties: 'always' }],
      'id-length': ['error', { min: 2, max: 30, exceptions: ['_', 'i', 'j', 'x', 'y', 'e'] }],
    },
  },
];
