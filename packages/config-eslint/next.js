const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'next',
    'turbo',
    'eslint:recommended',
    'prettier',
    'airbnb',
    'airbnb-typescript',
    'next/core-web-vitals',
    '@feature-sliced',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ['only-warn', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['.*.js', 'node_modules/', 'next.config.js'],
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
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
};
