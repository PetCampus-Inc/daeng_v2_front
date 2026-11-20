---
title: FE 코드 컨벤션 - 네이티브 기능
date: 2026-11-04
tags: [convention, native, bridge]
---
# FE 코드 컨벤션 - 네이티브 기능

웹(WebView)에서 앱의 네이티브 기능을 호출하는 브릿지 규칙.

## 목차

- 1. 네이티브 기능
  - 1-1. 이름
  - 1-2. 작성 방식

---

## 1. 네이티브 기능

### 1-1. 이름

#### 메서드 이름

- 추가 위치: `packages/bridge-core`의 `METHODS`만
- 값 형식: `도메인.동사`
- 이미 있는 문자열은 변경 금지 (앱에 배포된 웹이 그 문자열을 호출)

```tsx
analyticsLogEvent: 'analytics.logEvent',
openSettings: 'system.openSettings',
```

### 1-2. 작성 방식

#### 호출 방식

- 웹 컴포넌트에서 `ReactNativeWebView.postMessage` 직접 호출 금지
- `@shared/lib/bridge`의 함수만 사용

```tsx
openSystemSetting();
const { push } = useStackNavigation();
```

#### 타입 연결

- 인자·반환 타입: 그 도메인의 `rpc-schema.ts`에 연결
- 웹과 앱이 같은 패키지 사용

#### 앱 구현

- 위치: `apps/mobile/bridges/handlers/register-*.ts`의 `registerXxxHandlers`
- `register-all.ts`에 한 줄 등록
- 인자가 비어 있으면 `{ code: 'EINVALID', message }` throw

#### 웹 래퍼

- 위치: `apps/knockdog/src/shared/lib/bridge`
- 컴포넌트는 이 함수만 import

#### 역할 구분

- WebView 안 자바스크립트 예외: 웹 코드에서 처리
- 네이티브 핸들러: 권한·로그인·내비게이션·사진·분석 등 기기가 해야 하는 일만
