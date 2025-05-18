/* eslint-disable turbo/no-undeclared-env-vars */
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..', '..');

// 아이콘 컴포넌트 파일 생성 경로
export const ICON_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'components2');

// 아이콘 노드 이름 정규식
export const ICON_REG = /^ico_/;

// 피그마 API 토큰
export const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;

// 피그마 파일 ID
export const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_API_TOKEN || !FIGMA_FILE_ID)
  throw new Error(
    '`FIGMA_API_TOKEN` 또는 `FIGMA_FILE_ID` 환경 변수를 찾을 수 없습니다.'
  );
