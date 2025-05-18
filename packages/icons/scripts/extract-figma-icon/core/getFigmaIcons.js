import { fetchFigmaFile, fetchFigmaImages } from '../api/index.js';

/**
 * 피그마 아이콘을 조회합니다.
 * @param {RegExp} iconReg 아이콘 노드 이름 정규식 (기본값: `/^ico_/`)
 * @returns 아이콘 목록
 */
export const getFigmaIcons = async (iconReg = /^ico_/) => {
  try {
    // 피그마 파일 조회
    const { components } = await fetchFigmaFile();

    // 컴포넌트 중 특정 노드만 필터링 (iconReg 정규식)
    const iconNodes = Object.entries(components).filter(([, value]) =>
      iconReg.test(value.name)
    );

    // 노드 이미지 조회
    const iconNodeIds = iconNodes.map(([key]) => key);
    const { images } = await fetchFigmaImages(iconNodeIds);

    // 매핑된 데이터 반환
    return iconNodes.map(([key, value]) => {
      const image = images[key];
      return {
        name: value.name.replace(iconReg, ''),
        iconUrl: image,
      };
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};
