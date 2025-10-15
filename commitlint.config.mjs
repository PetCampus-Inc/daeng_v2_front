import { defineConfig } from 'cz-git';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packages = fs.readdirSync(path.resolve(__dirname, 'packages'));
const apps = fs.readdirSync(path.resolve(__dirname, 'apps'));

export default defineConfig({
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
    'subject-case': [0],
    'body-max-line-length': [0],
  },
  extends: ['@commitlint/config-conventional'],
  prompt: {
    messages: {
      type: '변경 사항의 유형을 선택하세요:',
      scope: '변경 사항의 범위(SCOPE)를 선택하세요 (optional):',
      subject: '변경 내용을 간결하고 명령형으로 작성하세요:\n',
      body: '변경 사항에 대한 자세한 설명을 작성하세요 (optional) 줄 바꿈은 "|" 사용:\n',
    },
    types: [
      {
        value: 'feat',
        name: 'feat:     새로운 기능 추가',
      },
      { value: 'fix', name: 'fix:      버그 수정' },
      {
        value: 'docs',
        name: 'docs:     문서 변경',
      },
      {
        value: 'style',
        name: 'style:    코드 스타일 변경',
      },
      {
        value: 'refactor',
        name: 'refactor: 리팩토링',
      },
      {
        value: 'perf',
        name: 'perf:     성능 개선',
      },
      {
        value: 'test',
        name: 'test:     테스트 추가/수정',
      },
      {
        value: 'build',
        name: 'build:    빌드 시스템/의존성 변경',
      },
      {
        value: 'ci',
        name: 'ci:       CI 설정/스크립트 변경',
      },
      {
        value: 'chore',
        name: 'chore:    그 외 변경',
      },
      {
        value: 'revert',
        name: 'revert:   이전 커밋 되돌리기',
      },
    ],
    scopes: [...apps, ...packages],
    enableMultipleScopes: true,
    allowEmptyScopes: true,
    allowCustomScopes: false,
    upperCaseSubject: null,
    skipQuestions: ['breaking', 'footerPrefix', 'footer', 'confirmCommit'],
  },
});
