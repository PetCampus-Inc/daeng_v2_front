---
title: FE 코드 컨벤션 - 코드 작성
date: 2026-11-03
tags: [convention, code]
---
# FE 코드 컨벤션 - 코드 작성

변수·상수, 함수, 타입, 컴포넌트를 작성할 때의 이름과 작성 방식 규칙.

- 순서: 적용 단위가 작은 것(이름 하나) → 큰 것(폴더·저장소)
- 출처 우선순위: Google TypeScript 가이드(GTS) → Google JavaScript 가이드(GJS) → Airbnb 가이드(Airbnb)
  - 셋 다 없는 규칙은 출처 생략
  - 출처는 해당 문장 끝에 〔〕로 표시, 일부만 맞는 경우 괄호로 범위 설명

출처 링크

- GTS: [https://google.github.io/styleguide/tsguide.html](https://google.github.io/styleguide/tsguide.html)
- GJS: [https://google.github.io/styleguide/jsguide.html](https://google.github.io/styleguide/jsguide.html)
- Airbnb: [https://github.com/airbnb/javascript](https://github.com/airbnb/javascript) (React 편: [https://github.com/airbnb/javascript/tree/master/react](https://github.com/airbnb/javascript/tree/master/react))

## 목차

- 1. 변수·상수
  - 1-1. 이름
- 2. 함수
  - 2-1. 이름
  - 2-2. 작성 방식
- 3. 타입
  - 3-1. 이름
  - 3-2. 작성 방식
- 4. 컴포넌트
  - 4-1. 이름
  - 4-2. props

---

## 1. 변수·상수

### 1-1. 이름

#### 식별자 길이

- 2자 이상, 30자 이하
- 예외: `_`, `i`, `j`, `x`, `y`, `e` 〔Airbnb [23.1](https://github.com/airbnb/javascript#naming--descriptive) (한 글자 이름을 피한다. 30자 상한은 가이드에 없다)〕

#### 변수·파라미터

- camelCase 〔GTS [#rules-by-identifier-type](https://google.github.io/styleguide/tsguide.html#rules-by-identifier-type)〕

```tsx
const userName = 'John';
```

#### 배열

- 복수형 사용
- `List` 접미사 금지

```tsx
// good
const reviews = ['a', 'b'];
// bad
const reviewList = ['a', 'b'];
```

#### boolean

- 변수와 boolean 반환 함수는 `is`, `has`로 시작 〔GJS [6.2.3](https://google.github.io/styleguide/jsguide.html#623-method-names) (`isFoo`·`hasFoo`만 언급)〕
- 가능 여부는 `can`으로 시작

```tsx
const isLoading = false;
const canSubmit = true;
const isExcludedAnalyticsUserId = (userId: string) => true;
```

#### 상수

- 모듈 최상위에 선언하고 재할당하지 않는 값
- UPPER_SNAKE_CASE
- 함수 안의 `const`: 재할당하지 않아도 camelCase 〔GTS [#constants](https://google.github.io/styleguide/tsguide.html#constants), GJS [6.2.5](https://google.github.io/styleguide/jsguide.html#625-constant-names)〕

```tsx
const API_BASE_URL = 'https://api.example.com';
const MAX_REVIEW_LENGTH = 2000;
```

#### 값을 묶은 객체

- UPPER_SNAKE_CASE
- 키: camelCase 〔GTS [#constants](https://google.github.io/styleguide/tsguide.html#constants)〕

```tsx
const ENROLLMENT_LABEL = {
  inSchool: '재원',
};
```

---

## 2. 함수

### 2-1. 이름

#### 기본 형식

- camelCase 사용 〔GTS [#rules-by-identifier-type](https://google.github.io/styleguide/tsguide.html#rules-by-identifier-type)〕

```tsx
const helloWorld = () => {};
```

#### 일반 함수

- 동사로 시작 〔GJS [6.2.3](https://google.github.io/styleguide/jsguide.html#623-method-names) (메서드 이름은 보통 동사)〕

#### 서버 통신 함수

- 형식: HTTP 메서드(get, post, put, patch, delete) + 자원
  
  | 동작    | 함수                  |
  | ----- | ------------------- |
  | 목록 조회 | `getHomes(filters)` |
  | 단건 조회 | `getHome(id)`       |
  

#### 변환 함수

- DTO·값을 화면 모델로 바꾸는 함수는 `to`로 시작
- `convert` 사용 금지

```tsx
const toKnockdogReview = (review: SchoolReview): KnockdogReview => {};
```

#### 생성 함수

- 서버 요청이 아닌, 새 값·객체를 만드는 함수는 `create`로 시작
- 서버에 만들어 달라는 요청은 `post` (위 서버 통신 함수)

```tsx
const createHello = () => {};
```

#### 걸러내기·찾기 함수

- 걸러서 배열 반환: `filter`로 시작
- 하나를 찾아 반환: `find`로 시작

#### 이벤트 처리 함수

- 컴포넌트 안 처리 함수: `handle`로 시작
- props로 넘기는 콜백: `on`으로 시작 〔Airbnb React [#ordering](https://github.com/airbnb/javascript/tree/master/react#ordering) (`handle`·`on` 접두사만. 단어 순서는 가이드에 없다)〕
- `handle` 뒤에 대상 + 이벤트 순 (`handleHomeClick`)

```tsx
const handleHomeClick = () => {};

<Button onClick={handleHomeClick} />
<UserCard onSelect={handleUserSelect} />
```

### 2-2. 작성 방식

#### 함수 선언 방식

- 모든 함수는 화살표 함수(Arrow Function)
- 컴포넌트·훅도 동일

```tsx
export const ComponentName = () => { ... };
export const useHookName = () => { ... };
```

#### 함수 인자

- `Params`로 정의
- path, query, body를 한 타입에 포함
- 컴포넌트 props와 섞지 않음

```tsx
interface GetSchoolReviewsParams {
  schoolId: number;
  sort: SchoolReviewSort;
  page: number;
}
```

---

## 3. 타입

### 3-1. 이름

#### 타입 이름

- PascalCase 사용 〔GTS [#rules-by-identifier-type](https://google.github.io/styleguide/tsguide.html#rules-by-identifier-type)〕
- `Type` 접미사 금지
- 구현체와 이름이 겹치면 도메인 이름으로 구분

```tsx
// good
interface Review {}
// bad
type ReviewType = {};
```

### 3-2. 작성 방식

#### any

- `any` 지양 〔GTS [#any-type](https://google.github.io/styleguide/tsguide.html#any-type)〕

#### interface와 type

- 객체 형태: `interface`
- 유니온·교차·기본형·매핑: `type` 〔GTS [#prefer-interfaces-over-type-literal-aliases](https://google.github.io/styleguide/tsguide.html#prefer-interfaces-over-type-literal-aliases)〕
- 예외: 서버 데이터는 Zod 스키마에서 `z.infer`로 뽑은 타입 사용 (`data-state.md` 1장)

```tsx
interface User {
  id: number;
  name: string;
}

type UserRole = 'admin' | 'user' | 'guest';
type CreateUserInput = Omit<User, 'id'>;
```

#### enum

- `enum` 사용 금지
- 대체: 상수 객체 + 유니온 타입

```tsx
const REVIEW_SORT = {
  latest: 'latest',
  rating: 'rating',
} as const;

type ReviewSort = (typeof REVIEW_SORT)[keyof typeof REVIEW_SORT];
```

#### 리액트 타입

- 개별 import 사용

```tsx
// good
import { type ReactNode } from 'react';
// bad
React.ReactNode;
```

---

## 4. 컴포넌트

### 4-1. 이름

#### 이름

- PascalCase 사용 〔Airbnb React [#naming](https://github.com/airbnb/javascript/tree/master/react#naming) (컴포넌트 PascalCase까지만)〕
- 명사형 이름 (`UserList`, `UserCard`)

```tsx
const VerifiedKindergartenMark = () => {};
```

### 4-2. props

- `interface`로 정의
- 이름은 `Props`로 끝남

```tsx
interface UserCardProps {
  user: User;
  onSelect?: (user: User) => void;
}

export const UserCard = ({ user, onSelect }: UserCardProps) => {
  return <div onClick={() => onSelect?.(user)}>{user.name}</div>;
};
```
