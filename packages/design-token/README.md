# Design Token Package

이 패키지는 프로젝트의 디자인 토큰을 관리합니다.

## 구조

### 1. `index.css`

- 모든 디자인 토큰의 **원본 값**들을 CSS 변수로 정의
- 색상, 차원, 타이포그래피, 반지름, 투명도 등의 기본 값들을 포함
- 다른 패키지에서 참조할 수 있는 기본 CSS 변수들

### 2. `tailwind4-theme/`

- Tailwind CSS 4의 `@theme` 블록을 사용하여 테마 변수 정의
- `index.css`의 원본 값들을 참조하여 Tailwind 테마 토큰으로 변환
- 컴포넌트별 유틸리티 클래스 정의

### 3. `vars/`

- TypeScript 타입 정의 및 토큰 값들을 객체로 export
- 런타임에서 토큰 값에 접근할 때 사용
- 타입 안전성 제공
- `.d.ts`와 `.mjs` 파일로 구성되어 CSS 변수 참조
