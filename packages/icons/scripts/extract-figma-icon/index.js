/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const {
  ICON_OUTPUT_PATH,
  ICON_REG,
  META_FILE_PATH,
} = require('./config/index.js');
const { getFigmaIcons } = require('./core/getFigmaIcons.js');
const { fetchSVG } = require('./api/index.js');
const { snakeToPascal } = require('./utils/snakeToPascal.js');
const { transSVGToJSX } = require('./utils/transSVGToJSX.js');

/**
 * 아이콘 메타 정보를 META_FILE_PATH에 JSON 형태로 저장하는 함수
 * @param {Array} icons - 피그마에서 추출한 아이콘 정보 배열
 */
const saveIconMetadata = async (icons) => {
  try {
    // 중복 아이콘 제거
    const uniqueIcons = Array.from(
      new Map(icons.map((icon) => [icon.name, icon])).values()
    );

    // SVG 해시값 계산을 위한 처리
    const iconsWithHash = await Promise.all(
      uniqueIcons.map(async (icon) => {
        if (!icon.iconUrl) {
          console.error(`아이콘 ${icon.name}에 이미지 URL이 없습니다.`);
          return { ...icon, hash: null };
        }

        try {
          // SVG 내용 가져오기
          const svgContent = await fetchSVG(icon.iconUrl);

          // SVG 내용으로 해시값 생성
          const hash = crypto
            .createHash('md5')
            .update(svgContent)
            .digest('hex');

          return {
            ...icon,
            hash,
          };
        } catch (error) {
          console.error(`아이콘 ${icon.name} 해시값 생성 실패:`, error);
          return { ...icon, hash: null };
        }
      })
    );

    // 메타데이터 구조 생성
    const metadata = {
      lastUpdated: new Date().toISOString(),
      totalIcons: iconsWithHash.length,
      icons: iconsWithHash.map((icon) => ({
        name: icon.name,
        componentName: snakeToPascal(icon.name.replace(' ', '_')),
        iconUrl: icon.iconUrl,
        hash: icon.hash,
      })),
    };

    // META_FILE_PATH 디렉토리 확인 및 생성
    const metaDir = path.dirname(META_FILE_PATH);
    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }

    // 메타데이터 파일 저장
    fs.writeFileSync(META_FILE_PATH, JSON.stringify(metadata, null, 2));
    console.info(`✅ 아이콘 메타데이터가 ${META_FILE_PATH}에 저장되었습니다.`);

    return iconsWithHash;
  } catch (error) {
    console.error('❌ 메타데이터 저장 중 오류 발생:', error);
    return icons;
  }
};

/**
 * 이전 메타데이터와 새 아이콘 데이터를 비교하여 변경사항을 판별하는 함수
 * @param {Array} newIcons - 새로 피그마에서 가져온 아이콘 정보
 * @returns {Object} 변경 상태 정보
 */
const detectIconChanges = async (newIcons) => {
  try {
    // 이전 메타데이터 불러오기
    let previousMetadata = { icons: [] };
    if (fs.existsSync(META_FILE_PATH)) {
      const metaContent = fs.readFileSync(META_FILE_PATH, 'utf8');
      previousMetadata = JSON.parse(metaContent);
    }

    // 새 아이콘 해시값 계산
    const newIconsWithHash = await Promise.all(
      newIcons.map(async (icon) => {
        if (!icon.iconUrl) return { ...icon, hash: null };

        try {
          const svgContent = await fetchSVG(icon.iconUrl);
          const hash = crypto
            .createHash('md5')
            .update(svgContent)
            .digest('hex');

          return {
            ...icon,
            hash,
            componentName: snakeToPascal(icon.name.replace(' ', '_')),
          };
        } catch (error) {
          console.error(`아이콘 ${icon.name} 해시값 생성 실패:`, error);
          return { ...icon, hash: null };
        }
      })
    );

    // 이전 아이콘과 새 아이콘을 비교하기 위한 맵 생성
    const prevIconsByHash = new Map();
    const prevIconsByName = new Map();

    previousMetadata.icons.forEach((icon) => {
      if (icon.hash) prevIconsByHash.set(icon.hash, icon);
      prevIconsByName.set(icon.name, icon);
    });

    // 변경 상태 분류
    const changes = {
      renamed: [], // 이름만 변경된 아이콘 (해시값 동일)
      modified: [], // 내용만 변경된 아이콘 (이름 동일, 해시값 변경)
      added: [], // 새로 추가된 아이콘
      deleted: [], // 삭제된 아이콘
    };

    // 새 아이콘 분석 (추가, 수정, 이름 변경)
    newIconsWithHash.forEach((newIcon) => {
      if (!newIcon.hash) return;

      const prevIconWithSameHash = prevIconsByHash.get(newIcon.hash);
      const prevIconWithSameName = prevIconsByName.get(newIcon.name);

      if (prevIconWithSameHash && prevIconWithSameHash.name !== newIcon.name) {
        // 해시값은 같지만 이름이 다른 경우 -> 이름 변경
        changes.renamed.push({
          oldName: prevIconWithSameHash.name,
          newName: newIcon.name,
          hash: newIcon.hash,
        });
      } else if (
        prevIconWithSameName &&
        prevIconWithSameName.hash !== newIcon.hash
      ) {
        // 이름은 같지만 해시값이 다른 경우 -> 내용 수정
        changes.modified.push({
          name: newIcon.name,
          oldHash: prevIconWithSameName.hash,
          newHash: newIcon.hash,
        });
      } else if (!prevIconWithSameName) {
        // 이전에 같은 이름의 아이콘이 없는 경우 -> 새로 추가
        changes.added.push({
          name: newIcon.name,
          hash: newIcon.hash,
        });
      }
    });

    // 삭제된 아이콘 탐지
    previousMetadata.icons.forEach((prevIcon) => {
      const exists = newIconsWithHash.some(
        (newIcon) =>
          newIcon.name === prevIcon.name || newIcon.hash === prevIcon.hash
      );
      if (!exists) {
        changes.deleted.push({
          name: prevIcon.name,
          hash: prevIcon.hash,
        });
      }
    });

    console.info('📊 ---- 아이콘 변경 사항 ---- 📊');
    console.info(`🏷️ 이름 변경: ${changes.renamed.length}개`);
    console.info(`🔄 내용 수정: ${changes.modified.length}개`);
    console.info(`➕ 새로 추가: ${changes.added.length}개`);
    console.info(`❌ 삭제됨: ${changes.deleted.length}개`);

    return { changes, newIconsWithHash };
  } catch (error) {
    console.error('아이콘 변경 감지 중 오류 발생:', error);
    return {
      changes: { renamed: [], modified: [], added: [], deleted: [] },
      newIconsWithHash: newIcons,
    };
  }
};

/** 피그마에서 아이콘을 추출해 React 컴포넌트 파일로 생성합니다. */
async function extractFigmaIconsToJSX() {
  console.info('🗂️ 피그마 아이콘 추출 시작');
  const icons = await getFigmaIcons(ICON_REG);

  const uniqueIcons = Array.from(
    new Map(icons.map((icon) => [icon.name, icon])).values()
  );

  // 아이콘 변경 감지
  const { changes, newIconsWithHash } = await detectIconChanges(uniqueIcons);

  // 이름이 변경된 아이콘의 이전 파일 삭제
  changes.renamed.forEach((renamedIcon) => {
    const oldComponentName = snakeToPascal(
      renamedIcon.oldName.replace(' ', '_')
    );
    const oldFilePath = path.join(ICON_OUTPUT_PATH, `${oldComponentName}.tsx`);

    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
      console.info(`🗑️ 이름 변경: ${oldComponentName}.tsx 파일 삭제됨`);
    }
  });

  // 삭제된 아이콘 파일도 제거
  changes.deleted.forEach((deletedIcon) => {
    const componentName = snakeToPascal(deletedIcon.name.replace(' ', '_'));
    const filePath = path.join(ICON_OUTPUT_PATH, `${componentName}.tsx`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.info(`🗑️ 삭제: ${componentName}.tsx 파일 삭제됨`);
    }
  });

  // 메타데이터 저장
  await saveIconMetadata(newIconsWithHash);

  // 폴더가 없다면 생성
  if (!fs.existsSync(ICON_OUTPUT_PATH))
    fs.mkdirSync(ICON_OUTPUT_PATH, { recursive: true });

  // 변경되거나 추가된 아이콘만 처리하기 위한 필터링
  const iconsToProcess = newIconsWithHash.filter((icon) => {
    // 새로 추가된 아이콘
    const isAdded = changes.added.some((added) => added.name === icon.name);

    // 내용이 수정된 아이콘
    const isModified = changes.modified.some(
      (modified) => modified.name === icon.name
    );

    // 이름이 변경된 아이콘
    const isRenamed = changes.renamed.some(
      (renamed) => renamed.newName === icon.name
    );

    return isAdded || isModified || isRenamed;
  });

  console.info(
    `⚙️ 처리할 아이콘: ${iconsToProcess.length}개 (변경/추가된 아이콘만)`
  );

  // 변경되거나 추가된 아이콘만 컴포넌트 파일 생성
  const iconPromises = iconsToProcess.map(async (icon) => {
    if (icon.iconUrl === null) return null;

    const iconName = icon.name.replace(' ', '_');
    const componentName = snakeToPascal(iconName);
    const svg = await fetchSVG(icon.iconUrl);
    const jsx = transSVGToJSX(svg, componentName);

    fs.writeFileSync(path.join(ICON_OUTPUT_PATH, `${componentName}.tsx`), jsx);
    console.info(`${componentName}.tsx 파일 생성 완료`);

    return componentName;
  });

  const processedComponents = (await Promise.all(iconPromises)).filter(Boolean);

  // 이미 존재하는 모든 아이콘 파일 읽기
  const existingFiles = fs
    .readdirSync(ICON_OUTPUT_PATH)
    .filter((file) => file.endsWith('.tsx') && file !== 'index.ts')
    .map((file) => file.replace('.tsx', ''));

  // 모든 export 문 생성
  const exportStatements = existingFiles.map(
    (componentName) => `export { ${componentName} } from './${componentName}';`
  );

  const indexFile = exportStatements.join('\n') + '\n';

  // index.ts 파일 생성
  fs.writeFileSync(path.join(ICON_OUTPUT_PATH, 'index.ts'), indexFile);

  console.info('🎉 피그마 아이콘 추출 완료');
  console.info(
    `✨ 총 ${processedComponents.length}개의 아이콘이 처리되었습니다.`
  );
}

extractFigmaIconsToJSX();
