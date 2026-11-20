/** 공지·약관 본문(Plate 블록 JSON) 노드를 다루는 순수 함수와 상수. */

type RichNode = Record<string, unknown>;

/** 백오피스 에디터의 글자 크기 선택 목록(px). 이 밖의 값은 무시한다. */
const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28];
const IMAGE_TYPES = ['img', 'image'];
const LINK_TYPES = ['a', 'link'];
const CONTAINER_KEYS = ['content', 'children', 'blocks', 'body'];

function isRecord(value: unknown): value is RichNode {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** 서버가 서명 URL을 만들지 못한 이미지는 unavailable로 내려온다. */
function isShowableImage(node: RichNode): node is RichNode & { url: string } {
  return (
    typeof node.type === 'string' && IMAGE_TYPES.includes(node.type) && node.unavailable !== true && isHttpUrl(node.url)
  );
}

/** 그려질 이미지의 URL을 본문 순서대로 모은다. */
function collectImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(collectImageUrls);
  if (!isRecord(value)) return [];
  if (typeof value.type === 'string' && IMAGE_TYPES.includes(value.type)) {
    return isShowableImage(value) ? [value.url] : [];
  }
  return CONTAINER_KEYS.flatMap((key) => collectImageUrls(value[key]));
}

export type { RichNode };
export { collectImageUrls, FONT_SIZES, IMAGE_TYPES, isHttpUrl, isRecord, isShowableImage, LINK_TYPES };
