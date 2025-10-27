// apps/mobile/metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config'); // 지금 쓰던 그대로

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..'); // monorepo root

const config = getDefaultConfig(projectRoot);

// ✅ 모노레포/심링크를 Metro가 추적하도록
config.watchFolders = [workspaceRoot];

// ✅ svg 트랜스포머 (기존 유지)
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

// ✅ pnpm/exports 해석 강화를 위해 resolver 보강
config.resolver = {
  ...config.resolver,

  // pnpm 심링크 지원
  unstable_enableSymlinks: true,

  // package.json "exports" 조건 우선순위 지정
  // (react-native → import → require 순서로 보게 함)
  unstable_conditionNames: ['react-native', 'import', 'require'],

  // 모노레포 최상위 node_modules도 해석 경로에 포함
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],

  // svg 설정(기존 유지)
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: Array.from(new Set([...config.resolver.sourceExts, 'svg'])),
};

module.exports = config;
