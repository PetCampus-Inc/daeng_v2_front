import { CTAG_MAP } from '../model/constants/compare';
import { CTag } from '../model/types';

/**
 * 카테고리 태그 배열을 한국어 문자열로 변환합니다.
 * @returns 변환된 카테고리 문자열 (예: '유치원 · 호텔')
 */
function serializeCategories(categories: CTag[], separator: string = ' · '): string {
  return categories.map((cat) => CTAG_MAP[cat]).join(separator);
}

export { serializeCategories };
