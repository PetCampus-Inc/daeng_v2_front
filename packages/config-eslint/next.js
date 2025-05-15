import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import neostandard from 'neostandard';
import tseslint from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import { config as baseConfig } from './base.js';
import importPlugin from 'eslint-plugin-import';
import fsdPlugin from 'eslint-plugin-fsd-lint';

export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  ...neostandard({ noStyle: true }),
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  fsdPlugin.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
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
    rules: {
      '@typescript-eslint/no-empty-function': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'error',
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'multi-line'],
      camelcase: ['error', { properties: 'always' }],
      'id-length': [
        'error',
        { min: 2, max: 30, exceptions: ['_', 'i', 'j', 'x', 'y'] },
      ],
      'import/prefer-default-export': 'off',
      'import/no-internal-modules': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
