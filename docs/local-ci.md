# 로컬 CI 린트·빌드

# 📌 실행 범위

## 1. 워크플로

CI 잡은 아래 경로에 있습니다.

```
.github/workflows/ci.yml
```

`develop`으로 가는 PR에서 다음 경로가 바뀌었을 때만 실행합니다.

- `apps/knockdog/**`
- `packages/**`

로컬 명령은 저장소 루트에서 실행합니다. 대상은 `apps/knockdog`과 그 의존 패키지입니다.

## 2. 실행하는 검사

| 잡 | 명령 | 타입 검사 |
| --- | --- | --- |
| lint | `pnpm turbo run lint --filter=knockdog` | 없음. `apps/knockdog`의 `eslint .` |
| build | `pnpm turbo run build --filter=knockdog...` | 있음. `next build`가 `apps/knockdog/tsconfig.json`으로 검사 |

`type-check` 잡은 CI에 없습니다. 워크플로 주석대로 다시 넣기 전까지는 빌드가 타입 검사입니다.

필터 차이:

- `knockdog`: 그 패키지만. lint는 turbo `dependsOn: ["^lint"]` 때문에 의존 패키지 lint도 따라감
- `knockdog...`: 그 패키지와 의존 패키지의 build

---

# 📌 로컬 실행

## 1. 환경 변수

추가 설정은 없습니다. `apps/knockdog/.env`의 `NEXT_PUBLIC_API_BASE_URL`을 그대로 씁니다.

`next build`가 읽는 파일:

- `.env`
- `.env.local`
- `.env.production`

`.env.development`는 읽지 않습니다. 셸에 같은 이름의 변수가 있으면 `.env`보다 우선합니다.

게스트 로그인 가드는 CI 워크플로 단계입니다. 셸의 `NEXT_PUBLIC_ENABLE_GUEST_LOGIN`이 `true`면 빌드 전에 실패합니다. `.env.development`의 `true`는 이 가드와 `next build`에 들어가지 않습니다.

## 2. PowerShell

```powershell
if ($env:NEXT_PUBLIC_ENABLE_GUEST_LOGIN -eq "true") {
  throw "NEXT_PUBLIC_ENABLE_GUEST_LOGIN must be unset/false for production builds"
}

pnpm turbo run lint --filter=knockdog
pnpm turbo run build --filter=knockdog...
```

## 3. bash

```bash
if [ "${NEXT_PUBLIC_ENABLE_GUEST_LOGIN:-}" = "true" ]; then
  echo "NEXT_PUBLIC_ENABLE_GUEST_LOGIN must be unset/false for production builds"
  exit 1
fi

pnpm turbo run lint --filter=knockdog
pnpm turbo run build --filter=knockdog...
```

---

# 📌 타입 검사

## 1. 빌드 전 타입 검사

빌드 전에 타입만 보려면 저장소 루트에서 실행합니다.

```powershell
pnpm --filter knockdog type-check
```

이 명령은 `apps/knockdog`에서 `tsc --noEmit`을 실행합니다. CI 잡과 같지는 않습니다. `next build`가 타입 오류로 실패하는 경우는 여기서 먼저 납니다.

저장소 루트의 `pnpm exec tsc --noEmit`은 검사로 치지 않습니다. 루트에 `tsconfig.json`이 없어 `TS5081`로 끝나고, knockdog 파일은 보지 않습니다.

## 2. 타입 오류를 보지 못하는 검사

- `pnpm exec vitest` / `pnpm test`: 트랜스파일만 하고 타입을 지움. `string | null`을 `string`에 넣는 대입은 통과
- 루트 `tsc --noEmit`: knockdog `tsconfig`를 쓰지 않음
- `pnpm type-check`: 스크립트는 `turbo type-check`. CI 매트릭스에는 없고, knockdog만 보려면 1절 명령을 사용
