---
title: FE 코드 컨벤션 - 스타일
date: 2026-11-09
tags: [convention, style, design-system, design-token]
---
# FE 코드 컨벤션 - 스타일

스타일을 작성하는 방식과 디자인 시스템을 우선 쓰는 규칙.

## 목차

- 1. 스타일
  - 1-1. 작성 방식
  - 1-2. 디자인 시스템 우선 사용
  - 1-3. 위치

---

## 1. 스타일

### 1-1. 작성 방식

#### 클래스 조합

- `cn`만 사용

#### 테마 색상

- shadcn 컨벤션에 따라 CSS 변수로 관리

#### Variants (cva)

- shadcn 컴포넌트 스타일은 `class-variance-authority(cva)`로 관리
- base 스타일에 `variant`/`size` 옵션별 클래스를 매핑
- 새 variant: `[component]Variants.ts`의 `variants` 객체에 키 추가

```tsx
// ui/buttonVariants.ts
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md ...', // base
  {
    variants: {
      variant: { default: '...', destructive: '...', outline: '...' },
      size: { default: '...', sm: '...', lg: '...' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);
```

### 1-2. 디자인 시스템 우선 사용

#### 값

- 색상·타이포·간격·반지름: `packages/design-token/`의 토큰 유틸리티 우선 사용 (`text-text-primary`, `gap-x1`)
- 임의의 hex 새로 추가 금지
- 기존 화면이 Tailwind 기본값이나 임의 숫자를 쓰더라도 그대로 복사 금지. 같은 의미의 프로젝트 토큰으로 바꿈
- 토큰에 없는 값(예: 56px 초과 크기)처럼 시스템으로 표현할 수 없는 값만 임의 값 허용
- 예: `rounded-lg` 대신 의미가 같은 `radius-r2`
- 예: `bg-white` 대신 배경 토큰
- 예: `h-[52px]` 대신 `h-x13`

#### 컴포넌트

- 버튼·입력·툴팁·바텀시트 등: `@knockdog/ui` 컴포넌트를 먼저 찾아 재사용
- 같은 모양을 슬라이스 안에 다시 만들지 않음

#### 아이콘

- `@knockdog/icons` 또는 기존 `<Icon>` 사용
- 인라인 SVG를 새로 만들지 않음

### 1-3. 위치

| 대상 | 위치 |
|---|---|
| 색상·간격·반지름·타이포 토큰 | `packages/design-token/` |
| 토큰 원본 값 | `packages/design-token/index.css` |
| Tailwind 매핑 | `packages/design-token/tailwind4-theme/theme.css` |
| 공통 UI 컴포넌트 | `packages/ui/` |
| 아이콘 | `packages/icons/` |
| 공통 로딩·입력 검사·오류 정책 | `docs/policy/loading-validation-error.md` |
