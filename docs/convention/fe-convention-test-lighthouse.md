---
title: FE 코드 컨벤션 - 테스트와 Lighthouse
date: 2026-11-04
tags: [convention, test, lighthouse]
---
# FE 코드 컨벤션 - 테스트와 Lighthouse

테스트 작성 기준·실행 범위·E2E 규칙과 Lighthouse 측정 규칙.

## 목차

- 1. 테스트
  - 1-1. 작성 기준
  - 1-2. 요소 찾기
  - 1-3. 실행 범위
  - 1-4. E2E
- 2. Lighthouse

---

## 1. 테스트

### 1-1. 작성 기준

- 목적: 기획이 정한 동작이 깨지지 않았는지 확인
- 이유: 화면 문구·배치처럼 기획 변경 없이 바뀔 수 있는 것에 묶이면, 동작은 그대로인데 테스트만 깨짐

#### 확인하는 것

- 판정·정렬·계산 규칙과 그 결과
- 사용자 흐름의 결과 (예: 저장하면 목록이 바로 바뀜, 실패하면 저장 전으로 돌아감)
- 데이터 정합성 (예: 저장이 원본을 바꾸지 않음, 한 묶음으로 성공하거나 실패함)
- 계산된 값이 들어간 문구
- 접근성 동작 (예: 키보드로 조작 가능, 모달이 닫히면 포커스 복귀)

#### 확인하지 않는 것

- 고정 문구 자체: 페이지 제목, 안내 문구, 토스트, 버튼 글자, 준비 중 화면 문구
- 배치와 마크업: 요소 순서, 줄 나눔, 태그 구조, 클래스, 요소 id
- 라이브러리가 보장하는 동작: Radix의 `aria-*` 속성

### 1-2. 요소 찾기

- 단위·컴포넌트 테스트: 역할과 접근성 이름으로 찾기 — `getByRole('button', { name: '저장' })`
- 고정 문구: 요소를 찾는 데만 사용, 문구가 맞는지는 검증하지 않음
- `querySelector`·태그 이름: 역할로 찾을 수 없을 때만 사용
- E2E: `getByTestId`만 사용 (1-4 참고)

### 1-3. 실행 범위


| 시점                                   | 실행할 테스트                                                               |
| ------------------------------------ | --------------------------------------------------------------------- |
| 작업 중 (기능 단위 변경)                      | 바뀐 코드와 관련된 테스트만: `pnpm vitest related <파일> --run` 또는 `pnpm test <경로>` |
| 여러 곳이 쓰는 코드(API, store, util)를 바꿨을 때 | 전체 테스트: `pnpm test`                                                   |
| 작업 브랜치를 `dev`에 머지하기 전                | 전체 테스트: `pnpm test`                                                   |


- 타입 검사(`pnpm typecheck`): 빠르므로 작업 중에도 계속 실행

### 1-4. E2E

#### 파일·이름

- 스펙 위치: `e2e/flows`만
- `test.describe` 이름: `CF-`로 시작
- 파일 이름: kebab-case

```tsx
test.describe('CF-OWNER-HOME', () => {});
```

#### import

- `test`, `expect`: `e2e/fixtures/test`에서 import
- `@playwright/test` 직접 import 금지 (GA 차단이 빠짐)

#### 로그인

- 카카오 로그인 사용 안 함
- `auth.setup.ts`의 DEV 로그인으로 만든 `owner.json`, `guardian.json`만 사용
- `.auth` 커밋 금지

#### 이동·확인

- 이동: `gotoAuthed`
- 역할 확인: `expectOwnerNav`, `expectGuardianNav`
- `waitForTimeout` 사용 금지

#### 요소 찾기

- 클릭·노출 확인: `getByTestId`만
- `data-testid`: Critical Flow 노드에만 부여
- 형식: `e2e/README.md`의 kebab-case

#### 범위

- 모든 화면에 스펙을 만들지 않음
- README의 CF 표에 없는 흐름은 추가 금지

---

## 2. Lighthouse

#### 측정 설정

- 측정 URL: `lighthouserc.cjs`의 `collect.url`만 수정
- 환경: 모바일 `390×844`, `preset: 'perf'`
- 방식: 3회 측정, 중앙값

#### 로그인

- 파일: `lighthouse/auth.cjs`
- e2e와 같은 DEV 로그인 id 사용
- `disableStorageReset: true`로 세션 유지

#### assert

- 수준: `warn` (`error`로 올리지 않음)
- PR 머지를 막지 않음
- 기준
  - 성능 0.4
  - FCP 4초
  - LCP 6초
  - TBT 800ms
  - CLS 0.25
  - Speed Index 8초

#### baseline

- 파일 직접 수정 금지
- 갱신: `pnpm lighthouse:baseline`
- 코멘트: `pnpm lighthouse:comment`

#### URL 추가

- 대상: 앨범·비교·마이페이지·멤버처럼 이미 측정 중인 종류의 화면
- 제외: 약관·로그인 화면

#### 악화 등급

- baseline 대비 15% 이하: 양호
- 25% 이하: 경고
- 25% 초과: 나쁨
- 등급과 무관하게 머지를 막지 않음
