/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable turbo/no-undeclared-env-vars */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const ROOT_DIR = path.resolve(__dirname, '..', '..');

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
};
