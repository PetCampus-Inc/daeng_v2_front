/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const { ICON_OUTPUT_PATH, ICON_REG } = require('./config/index.js');
const { getFigmaIcons } = require('./core/getFigmaIcons.js');
const { fetchSVG } = require('./api/index.js');
const { snakeToPascal } = require('./utils/snakeToPascal.js');
const { transSVGToJSX } = require('./utils/transSVGToJSX.js');

/** 피그마에서 아이콘을 추출해 React 컴포넌트 파일로 생성합니다. */
async function extractFigmaIconsToJSX() {
  console.info('🗂️ 피그마 아이콘 추출 시작');
  const icons = await getFigmaIcons(ICON_REG);

  const uniqueIcons = Array.from(
    new Map(icons.map((icon) => [icon.name, icon])).values()
  );

  // 폴더가 없다면 생성
  if (!fs.existsSync(ICON_OUTPUT_PATH))
    fs.mkdirSync(ICON_OUTPUT_PATH, { recursive: true });

  // 아이콘 컴포넌트 파일 생성
  const iconPromises = uniqueIcons.map(async (icon) => {
    if (icon.iconUrl === null) return null;

    const iconName = icon.name.replace(' ', '_');
    const componentName = snakeToPascal(iconName);
    const svg = await fetchSVG(icon.iconUrl);
    const jsx = transSVGToJSX(svg, componentName);

    fs.writeFileSync(path.join(ICON_OUTPUT_PATH, `${componentName}.tsx`), jsx);
    console.info(`${componentName}.tsx 파일 생성 완료`);

    return `export { ${componentName} } from './${componentName}';`;
  });

  const exportStatements = (await Promise.all(iconPromises)).filter(Boolean);
  const indexFile = exportStatements.join('\n') + '\n';

  // index.ts 파일 생성
  fs.writeFileSync(path.join(ICON_OUTPUT_PATH, 'index.ts'), indexFile);

  console.info('🎉 피그마 아이콘 추출 완료');
}

extractFigmaIconsToJSX();
