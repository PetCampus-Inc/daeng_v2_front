import fs from 'fs';
import path from 'path';

// 현재 스크립트 파일의 디렉토리를 기준으로 경로 설정
const currentDir = __dirname;
const appDirectory = path.join(currentDir, '..', '..', '..', 'app');
const constantFilePath = path.join(currentDir, '..', '..', 'shared', 'constants', 'pathname.ts');

// 경로를 상수 이름으로 변환하는 함수
function pathToConstantName(filePath: string) {
  const relativePath = path.relative(appDirectory, filePath).replace(/\/page\.tsx$/, '');

  if (!relativePath) {
    throw new Error(`Invalid path: ${filePath}`);
  }

  const constantNamePart = relativePath
    .replace(/\[([^\]]+)\]/g, '$1') // 대괄호 내용 보존
    .replace(/\.\.\./g, 'CATCH_ALL') // 명시적 catch-all 처리
    .toUpperCase()
    .replace(/[\\/\\-]/g, '_')
    .replace(/[^A-Z0-9_]/g, '_'); // 특수문자 처리

  return `${constantNamePart}_PATHNAME`;
}

// 상수 값 생성
function createConstantValue(filePath: string) {
  return '/' + path.relative(appDirectory, filePath).replace(/\/page\.tsx$/, '');
}

// 디렉토리를 재귀적으로 탐색하는 함수
function traverseDirectory(dir: string, fileList: string[] = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach((file: string) => {
      const filePath = path.join(dir, file);
      try {
        if (fs.statSync(filePath).isDirectory()) {
          traverseDirectory(filePath, fileList);
        } else if (
          file === 'page.tsx' &&
          // app/page.tsx 제외
          filePath !== path.join(appDirectory, 'page.tsx')
        ) {
          fileList.push(filePath);
        }
      } catch (statError) {
        console.warn(`파일 상태 확인 실패: ${filePath}`, statError);
      }
    });
  } catch (error) {
    console.error(`디렉토리 읽기 실패: ${dir}`, error);
    throw error;
  }

  return fileList;
}

// 모든 page.tsx 파일 찾기
const pageFiles = traverseDirectory(appDirectory);

// 새로운 상수들을 저장할 배열
const newConstants: string[] = [];

// 각 page.tsx 파일에 대해 상수 생성
pageFiles.forEach((filePath) => {
  const constantName = pathToConstantName(filePath);
  const constantValue = createConstantValue(filePath);
  newConstants.push(`export const ${constantName} = "${constantValue}";`);
});

// 새로운 상수들 추가
const updatedContent = `${newConstants.join('\n')}\n`;

// 파일에 쓰기
try {
  const dir = path.dirname(constantFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(constantFilePath, updatedContent);
  console.log(`${newConstants.length}개의 상수가 ${constantFilePath}에 업데이트되었습니다.`);
} catch (error) {
  console.error(`파일 쓰기 실패: ${constantFilePath}`, error);
  process.exit(1);
}
