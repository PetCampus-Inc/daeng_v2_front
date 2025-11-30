/* eslint-disable @typescript-eslint/no-require-imports */
const { fetchFigmaFile, fetchFigmaImages } = require('../api/index.js');

/**
 * 피그마 아이콘을 조회합니다.
 * @param {RegExp} iconReg 아이콘 노드 이름 정규식 (기본값: `/^ico_/`)
 * @returns 아이콘 목록
 */
module.exports.getFigmaIcons = async (iconReg = /^ico_/) => {
  try {
    console.info('🔍 피그마 파일 조회 중...');
    // 피그마 파일 조회
    const fileData = await fetchFigmaFile();

    // API 응답에 에러가 있는지 확인
    if (fileData.err) {
      console.error('❌ 피그마 API 에러:', fileData.err);
      return [];
    }

    // components가 없거나 null인 경우 처리
    const components = fileData.components || {};
    if (!components || typeof components !== 'object') {
      console.error('❌ 피그마 응답에 components가 없습니다. 응답 구조:', Object.keys(fileData));
      return [];
    }

    // 컴포넌트 중 특정 노드만 필터링 (iconReg 정규식)
    const iconNodes = Object.entries(components).filter(([, value]) => iconReg.test(value.name));

    console.info(`🔍 피그마에서 ${iconNodes.length}개의 아이콘 노드를 찾았습니다.`);

    // 노드 이미지 조회
    const iconNodeIds = iconNodes.map(([key]) => key);
    console.info('🔍 피그마 아이콘 이미지 조회 중...');
    const { images } = await fetchFigmaImages(iconNodeIds);

    console.info(`🔍 피그마 아이콘 이미지 조회 완료 (${Object.keys(images).length}개)`);

    // 매핑된 데이터 반환 (iconUrl이 null이 아닌 객체만 반환)
    return iconNodes
      .map(([key, value]) => {
        const image = images[key];
        return {
          name: value.name.replace(iconReg, ''),
          iconUrl: image,
        };
      })
      .filter((icon) => icon.iconUrl !== null);
  } catch (error) {
    console.error('❌ 피그마 API 호출 중 오류 발생:', error);
    return [];
  }
};
