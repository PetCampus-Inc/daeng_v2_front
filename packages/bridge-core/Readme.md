# @knockdog/bridge-core

웹과 네이티브 앱 간의 통신을 위한 브릿지의 핵심 타입 정의 및 유틸리티 패키지입니다.



## 설계 원칙

- 모든 request-response / 이벤트 타입은 bridge-core에서만 정의한다.
- 외부에서 가져다 쓰는 엔트리는 src/index.ts에서 명시적으로 re-export합니다. (폴더 깊숙이 import 금지)
- 패키지는 monorepo 내부에서 TS 소스를 직접 소비하는 구조를 전제로 합니다. (build 안해도 되도록)
    - bridge-core / bridge-web / bridge-native 모두 dist를 만들지 않도록
    - Next: transpilePackages로 워크스페이스 패키지를 트랜스파일

## 개요

`bridge-core`는 웹과 네이티브 환경 간의 RPC(Remote Procedure Call) 통신을 위한 타입 안전한 인터페이스를 제공합니다. 이 패키지는 브릿지 프로토콜의 메시지 형식, RPC 메서드 스키마, 에러 처리, 이벤트 시스템 등을 정의합니다.

## 주요 기능

### RPC 메서드

다음 도메인별 RPC 메서드를 지원합니다:

- **Device**: 위치 정보, Safe Area 등 디바이스 관련 기능
- **System**: 전화 걸기, 클립보드, 공유, 외부 링크 열기 등 시스템 기능
- **Navigation**: 네비게이션 스택 관리 (push, back, reset, replace, switchTab)
- **Toast**: 토스트 메시지 표시/제거
- **Auth**: 소셜 로그인 (Kakao, Google, Apple)
- **Media**: 이미지 선택 등 미디어 관련 기능

### 메시지 프로토콜

브릿지 통신을 위한 표준 메시지 형식을 정의합니다:

- `BridgeRequest`: RPC 요청 메시지
- `BridgeResponse`: RPC 응답 메시지
- `BridgeEvent`: 이벤트 메시지

### 에러 처리

타입 안전한 에러 처리 시스템:

- `BridgeErrorShape`: 표준 에러 형식
- `BridgeException`: 에러 예외 클래스
- 도메인별 에러 코드 (예: `LOCATION_ERROR_CODES`)

### 이벤트 시스템

도메인별 이벤트 타입 정의:

- `BridgeEventMap`: 전체 이벤트 맵 타입
- 도메인별 이벤트 (Toast, Navigation, Media, System 등)

## 폴더 구조

```
src/
├── constants/          # 상수 정의 (브릿지 버전 등)
├── domains/           # 도메인별 타입 및 스키마 정의
│   ├── app-version/   # 앱 버전 관련
│   ├── auth/          # 인증 관련
│   ├── location/      # 위치 정보 관련
│   ├── media/         # 미디어 관련
│   ├── navigation/    # 네비게이션 관련
│   ├── safe-area/     # Safe Area 관련
│   ├── system/        # 시스템 기능 관련
│   └── toast/         # 토스트 메시지 관련
├── error/             # 에러 타입 및 예외 클래스
├── events/             # 이벤트 타입 정의
├── message/            # 메시지 프로토콜 정의
├── rpc/                # RPC 메서드 및 스키마 정의
└── utils/              # 유틸리티 함수 (ID 생성, JSON 파싱 등)
```

## 사용 예시

### 타입 가져오기

```typescript
import type { 
  RPCMethod, 
  ParamsOf, 
  ResultOf,
  BridgeRequest,
  BridgeMessage 
} from '@knockdog/bridge-core';

import { METHODS } from '@knockdog/bridge-core';
```

### RPC 메서드 사용

```typescript
// 메서드 이름
const method: RPCMethod = METHODS.getCurrentLocation;

// 파라미터 타입
type Params = ParamsOf<typeof METHODS.getCurrentLocation>;

// 결과 타입
type Result = ResultOf<typeof METHODS.getCurrentLocation>;
```

### 도메인별 타입 사용

```typescript
import type { 
  Location, 
  PermissionStatus,
  ToastShowParams,
  ToastPosition,
  ImageAsset,
  PickImageResult 
} from '@knockdog/bridge-core';
```

### 에러 처리

```typescript
import { BridgeException, LOCATION_ERROR_CODES } from '@knockdog/bridge-core';

// 에러 코드 사용
if (error.code === LOCATION_ERROR_CODES.PERMISSION_DENIED) {
  // 권한 거부 처리
}
```

### 유틸리티 함수

```typescript
import { makeId, safeParse, BRIDGE_VERSION } from '@knockdog/bridge-core';

// 고유 ID 생성
const id = makeId();

// 안전한 JSON 파싱
const result = safeParse(jsonString);

// 브릿지 버전 확인
console.log(BRIDGE_VERSION);
```

## RPC 메서드 목록

### Device
- `device.getLatLng`
- `device.getSafeAreaInsets`
- `device.getCurrentLocation`
- `device.getLocationPermission`
- `device.requestLocationPermission`
- `device.isLocationServiceEnabled`
- `device.getLastKnownLocation`

### System
- `system.callPhone`
- `system.copyToClipboard`
- `system.share`
- `system.openExternalLink`
- `system.openSettings`
- `system.getAppVersion`

### Navigation
- `system.navPush`
- `system.navBack`
- `system.navReset`
- `system.navReplace`
- `system.navSwitchTab`

### Toast
- `toast.show`
- `toast.dismiss`
- `toast.clear`

### Auth
- `auth.kakaoLogin`
- `auth.googleLogin`
- `auth.appleLogin`

### External
- `naver.openRoute`

## 개발

```bash
# 타입 체크
pnpm build

# 개발 모드 (타입 체크)
pnpm dev
```

## 관련 패키지

- `@knockdog/bridge-web`: 웹 환경 브릿지 구현
- `@knockdog/bridge-native`: 네이티브 환경 브릿지 구현
