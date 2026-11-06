---
title: FE 코드 컨벤션 - 파일과 폴더
date: 2026-11-04
tags: [convention, file, folder]
---
# FE 코드 컨벤션 - 파일과 폴더

파일 이름, export·import 방식, FSD 폴더 구조를 정한 규칙.

## 목차

- 1. 파일
  - 1-1. 이름
  - 1-2. export
  - 1-3. import
- 2. 폴더 구조 (FSD)
  - 2-1. 이름
  - 2-2. 구조

---

## 1. 파일

### 1-1. 이름

#### 컴포넌트 파일

- PascalCase 사용 〔Airbnb React [#naming](https://github.com/airbnb/javascript/tree/master/react#naming) (컴포넌트 파일 PascalCase까지만)〕

#### 컴포넌트가 아닌 파일

- camelCase 사용

```
ui/VerifiedKindergartenMark.tsx
api/useKindergartenMainQuery.ts
model/review.ts
```

#### 서브패스

- `.model.ts`, `.query.ts` 사용 금지
- 같은 역할은 슬라이스 안의 폴더로 구분

### 1-2. export

#### default export

- default export 금지, named export만 사용 〔GTS [#exports](https://google.github.io/styleguide/tsguide.html#exports), GJS [3.4.2.1](https://google.github.io/styleguide/jsguide.html#3421-named-vs-default-exports) (default export 금지까지만. 맨 아래에 모으는 위치는 가이드에 없다)〕

#### named export 위치

- 파일 맨 아래에서 한꺼번에 export

```tsx
const VerifiedKindergartenMark = () => {};

export { VerifiedKindergartenMark };
```

### 1-3. import

#### 슬라이스 밖에서 가져오기

- 그 슬라이스의 `index.ts`에 있는 이름만 import
- 내부 직접 import 금지 (`@features/review/ui/MyReviewCard`)

#### import 정렬

- 순서: 외부 라이브러리 → 절대 경로(`@`) → 상대 경로
- 같은 라우트 폴더 안은 상대 경로 권장

```tsx
// 1. React 및 외부 라이브러리
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. 절대 경로 import (@로 시작, 프로젝트 루트 기준)
import { createSupabaseClient } from '@/api/supabase';
import type { User } from '@/type/user';

// 3. 상대 경로 import (같은 라우트 폴더 내부는 상대 경로 권장)
import { useUsers } from '../util/useUsers';
```

---

## 2. 폴더 구조 (FSD)

- 공식 문서: [Overview](https://feature-sliced.design/docs/get-started/overview), [Slices and segments](https://feature-sliced.design/docs/reference/slices-segments)

### 2-1. 이름

#### 폴더 이름

- kebab-case 사용

```
good  kindergarten-main
bad   kindergartenMain
```

### 2-2. 구조

#### 슬라이스 안 폴더


| 폴더       | 내용                                     |
| -------- | -------------------------------------- |
| `ui`     | 컴포넌트                                   |
| `model`  | 타입, 변환, 화면 모델                          |
| `api`    | `get`, `useXxxQuery`, `useXxxMutation` |
| `lib`    | 그 슬라이스에서만 쓰는 유틸, 훅                     |
| `config` | 상수, 문구                                 |


#### 계층

- 순서: 아래 계층이 위 계층을 import하지 않음
- 같은 계층의 슬라이스끼리 import하지 않음


| 계층         | 역할                            |
| ---------- | ----------------------------- |
| `app`      | 라우트, 프로바이더                    |
| `views`    | 페이지 조합. `pages`라는 이름은 쓰지 않는다  |
| `widgets`  | 여러 feature를 묶는 블록             |
| `features` | 사용자 동작과 그 동작의 query, mutation |
| `entities` | 유치원, 리뷰, 메모처럼 도메인 모델과 조회 API  |
| `shared`   | 도메인을 모르는 공용 코드                |
