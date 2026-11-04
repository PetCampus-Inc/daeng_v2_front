---
title: FE 코드 컨벤션 - 데이터와 상태
date: 2026-11-03
tags: [convention, data, state]
---
# FE 코드 컨벤션 - 데이터와 상태

서버 데이터를 정의하는 방법(DTO), 서버 상태(React Query, API 에러), 클라이언트 상태(Zustand)를 정한 규칙.

## 목차

- 1. 서버 데이터 정의 (DTO)
  - 1-1. 이름
  - 1-2. 작성 방식
- 2. 서버 상태
  - 2-1. React Query
  - 2-2. API 에러
- 3. 클라이언트 상태 (Zustand)

---

- 이름·함수·타입 규칙은 `fe-convention-code.md` 참고

---

## 1. 서버 데이터 정의 (DTO)

- 서버 JSON은 Zod 스키마로 검사
- 화면은 `to` 함수로 바꾼 화면 모델 사용

### 1-1. 이름

#### 이름

- 화면 모델: 접미사 없음

```tsx
// good
type SchoolReviewItemDto = z.infer<typeof schoolReviewItemDtoSchema>;
interface SchoolReview {}

// bad
interface SchoolReview {} // 응답 JSON과 화면 모델이 같은 이름
type SchoolReviewType = {};
```

### 1-2. 작성 방식

#### 정의 방식

- 서버 데이터 모양: Zod 스키마 하나로 정의
- `Dto` 타입: `z.infer`로 생성
- 이유: TypeScript 타입은 런타임에 사라져 실제 데이터를 검사하지 못함
- 외부에서 들어오는 데이터는 반드시 스키마로 검증

#### 필드

- 서버 키 그대로 유지
- 이름 변경·기본값·포맷은 `to` 함수에서만 처리
- 빈 값 대입: `to` 안에서 처리

```tsx
const schoolReviewItemDtoSchema = z.object({
  images: z.unknown().optional(),
  createdAt: z.union([z.string(), z.array(z.number()), z.null()]).optional(),
});

type SchoolReviewItemDto = z.infer<typeof schoolReviewItemDtoSchema>;

const toSchoolReview = (dto: SchoolReviewItemDto): SchoolReview => {
  return {
    photos: toPhotos(dto.images),
    createdAt: toDateTime(dto.createdAt),
  };
};
```

#### UI에 넘기는 값

- UI props·훅 반환값에 DTO 금지
- query의 `select`에서 `to`를 적용한 모델 전달

---

## 2. 서버 상태

### 2-1. React Query

#### 쿼리 키

- `config`의 팩토리 객체로 관리
- 루트 키 `all` 선언
- 하위 키는 그 배열을 펼침

```tsx
const memoQueryKeys = {
  all: ['memo'] as const,
  byTargetId: (targetId: string) => [...memoQueryKeys.all, targetId] as const,
} as const;
```

#### 쿼리 옵션

- `queryKey`·`queryFn`을 `createXxxQueryOptions`에 함께 정의
- 컴포넌트 안에서 키 배열 직접 생성 금지

#### 캐시 무효화

- mutation 성공 시 같은 팩토리 키로 `invalidateQueries` 호출
- 웹·WebView 공유 데이터: `syncWebViewQuery.invalidate`에 같은 키 전달

### 2-2. API 에러

- 기준: 외부 가이드가 아니라 `apps/knockdog/src/shared/api`의 현재 클라이언트

#### 에러 던지기

- HTTP 실패는 `ApiError`로 throw
- `status`, `code`, `message` 포함

#### 처리 위치

- 화면이 이미 처리하는 401·입력 오류·비즈니스 오류: 그 화면에서 종료
- 빈 `catch`로 삼키지 않음

#### 공통 문구

- `shared/api`의 `isTimeoutError`, `REQUEST_FAILED_MESSAGE` 사용
- 화면마다 문구 새로 만들지 않음

---

## 3. 클라이언트 상태 (Zustand)

#### 담는 값

- 서버에서 받아 목록·상세에 보여주는 값: 스토어 금지, React Query에 보관
- 스토어에 담는 값: 로그인 사용자, 선택 탭, 바텀 내비게이션 등 화면 사이에 남는 값

#### 스토어 함수 이름

- 값 변경: `set`으로 시작
- 값 비우기: `clear`로 시작

```tsx
setUser: (user) => set({ user }),
clearUser: () => set({ user: null }),
```

---
