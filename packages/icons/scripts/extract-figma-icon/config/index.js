/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR = path.join(__dirname, '..', 'data');

// 아이콘 메타데이터 파일 저장 경로
const META_FILE_PATH = path.join(DATA_DIR, '.icons-meta.json');

// 아이콘 컴포넌트 파일 생성 경로
const ICON_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'components');

// 아이콘 노드 이름 정규식
const ICON_REG = /^ico_/;

// 피그마 API 토큰
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;

// 피그마 파일 ID
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_API_TOKEN || !FIGMA_FILE_ID)
  throw new Error(
    '`FIGMA_API_TOKEN` 또는 `FIGMA_FILE_ID` 환경 변수를 찾을 수 없습니다.'
  );

module.exports = {
  ICON_OUTPUT_PATH,
  ICON_REG,
  FIGMA_API_TOKEN,
  FIGMA_FILE_ID,
  META_FILE_PATH,
};
