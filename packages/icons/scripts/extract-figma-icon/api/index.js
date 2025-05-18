import { FIGMA_API_TOKEN, FIGMA_FILE_ID } from '../config/index.js';

const FIGMA_API_BASE_URL = 'https://api.figma.com/v1';
const headers = { 'X-Figma-Token': FIGMA_API_TOKEN };

/**
 * Figma API를 통해 파일 정보를 가져옵니다.
 * @returns {Promise<Object>} - 파일 정보
 */
export async function fetchFigmaFile() {
  const response = await fetch(`${FIGMA_API_BASE_URL}/files/${FIGMA_FILE_ID}`, {
    headers,
  });
  return response.json();
}

/**
 * Figma API를 통해 노드 정보를 가져옵니다.
 * @param {string[]} nodeIds - 가져올 노드 ID 배열
 * @returns {Promise<Object>} - 노드 정보
 */
export async function fetchFigmaNodes(nodeIds) {
  const response = await fetch(
    `${FIGMA_API_BASE_URL}/files/${FIGMA_FILE_ID}/nodes?ids=${nodeIds}`,
    {
      headers,
    }
  );
  return response.json();
}

/**
 * Figma API를 통해 이미지 노드 정보를 가져옵니다.
 * @param {string} nodeIds - 가져올 노드 ID 배열
 * @param {string} format - 이미지 형식
 * @returns {Promise<Object>} - 이미지 정보
 */
export async function fetchFigmaImages(nodeIds, format = 'svg') {
  const params = new URLSearchParams({
    format,
    ids: nodeIds.join(','),
    svg_simplify_stroke: 'true',
  });

  const response = await fetch(
    `${FIGMA_API_BASE_URL}/images/${FIGMA_FILE_ID}?${params.toString()}`,
    {
      headers,
    }
  );

  return response.json();
}

/**
 * SVG를 가져옵니다.
 * @param {string} url - SVG URL
 * @returns {Promise<string>} - SVG 문자열
 */
export async function fetchSVG(url) {
  const response = await fetch(url);
  return response.text();
}
