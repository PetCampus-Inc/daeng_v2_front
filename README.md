# Daeng V2 Monorepo

모노레포 구조로 구성된 Daeng V2 프로젝트

## 시작하기

프로젝트를 처음 클론한 경우:

```sh
# 1. 의존성 설치
pnpm install

# 2. 빌드 (반드시 dev 전에 실행)
pnpm build

# 3. 개발 서버 실행
pnpm dev
```

**⚠️ 중요:** `pnpm dev` 실행 전에 반드시 `pnpm build`를 먼저 실행해야 합니다. workspace 패키지들이 빌드되지 않으면
모듈을 찾을 수 없다는 에러가 발생합니다.

## 프로젝트 구조

### Apps

- `knockdog`: Next.js 웹 애플리케이션
- `mobile`: React Native (Expo) 모바일 앱
- `storybook`: UI 컴포넌트 스토리북

### Packages

- `@daeng-design/*`: Headless UI 컴포넌트 라이브러리
- `@knockdog/ui`: UI 컴포넌트
- `@knockdog/icons`: 아이콘
- `bridge-*`: 웹/네이티브 브릿지
- `naver-map`: 네이버 지도 래퍼
- `design-token`: 디자인 토큰

## 빌드 & 개발

### 전체 빌드

```sh
pnpm build
```

### 개발 모드

```sh
pnpm dev
```

### 특정 앱만 실행

```sh
pnpm --filter knockdog dev
pnpm --filter mobile dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to
share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't
have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your
[Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
