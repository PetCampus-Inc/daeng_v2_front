# E2E 가이드 (Playwright)

## 실행

```bash
pnpm e2e

# UI 모드
pnpm e2e:ui

# 리포트
pnpm e2e:report
```

## Env

| 변수 | 기본 | 설명 |
|------|------|------|
| `E2E_BASE_URL` | `http://localhost:3000` | 앱 URL |
| `E2E_API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` | `https://api.knockdog.net` | DEV API |
| `E2E_DEV_LOGIN_ID` | `113` | DEV login 유저 id (LHCI와 동일) |
| `E2E_EXPECTED_EMAIL` | `hyeonsu-k@kakao.com` | 매핑 경고용 (불일치 시 warn만) |
| `E2E_SKIP_WEBSERVER` | — | `1`이면 Playwright webServer 스킵 (CI가 서버 기동) |

카카오 OAuth는 CI에서 쓰지 않는다. **DEV login(Node `request` → `api.knockdog.net`) → `addInitScript` localStorage → storageState**.

> 브라우저 fetch는 CORS로 실패함. Playwright request는 Node라 API 직접 호출 가능 (CI `next start`도 OK).

## CI

- Workflow: `.github/workflows/e2e.yml`
- trigger: PR → `develop` (path filter: knockdog / e2e / packages)
- **non-blocking** (`continue-on-error: true`) — LHCI와 별 workflow 병렬
- artifact: `playwright-report` + `test-results` (14일)
- PR 코멘트: PASS/FAIL + run 링크

## Auth state

```
auth.setup
  └─ DEV login (hyeonsu 계정 가정)
        ├─ prefersGuardianView=false → e2e/.auth/owner.json
        └─ prefersGuardianView=true  → e2e/.auth/guardian.json
```

`.auth/*.json` 은 gitignore. 커밋 금지.


| 파일 | 역할 |
|------|------|
| `fixtures/test.ts` | context 단위 GA/트래킹 차단 |
| `helpers/network.ts` | gtag/collect abort + `ga-disable-G-3XK1LPFE9J` + gtag noop |
| `helpers/nav.ts` | owner/guardian nav assert, hard sleep 금지 |
| `flows/analytics-block.spec.ts` | GA 미전송 가드 |

**GA는 E2E에서 나가지 않음** (네트워크 abort + init script). 실서비스 GA 수치 오염 방지.

## 주요 사용자 시나리오 (스펙)

| ID | 파일 |
|----|------|
| CF-AUTH | `auth.setup.ts` + `auth.smoke.spec.ts` |
| CF-OWNER-HOME | `owner-home.spec.ts` |
| CF-OWNER-DAILY | `owner-daily.spec.ts` |
| CF-OWNER-INVITE | `owner-invite.spec.ts` |
| CF-GUARDIAN-HOME | `guardian-home.spec.ts` |
| CF-GUARDIAN-ALBUM | `guardian-album.spec.ts` |
| CF-MYPAGE-TOGGLE | `mypage-toggle.spec.ts` |

## data-testid 컨벤션

- **형식**: `kebab-case`, 영역-요소
- **위치**: Critical Flow 클릭/노출 노드만
- **nav**: `bottom-nav`, `bottom-nav-{path-slug}`, `data-nav-mode="owner|guardian"`

| testid | 위치 |
|--------|------|
| `login-provider-*` / `login-guest` | 로그인 |
| `bottom-nav*` | 바텀내비 |
| `owner-home-*` | 원장 홈 |
| `owner-daily-*` | 일과 탭 |
| `owner-members-invite-*` / `owner-invite-*` | 초대 시트 |
| `guardian-album-*` | 앨범/상세 |
| `mypage-role-toggle` | 역할 전환 |

## Projects

| project | storageState | 대상 |
|---------|--------------|------|
| `setup` | — | `auth.setup.ts` |
| `chromium-anon` | 없음 | `auth.smoke.spec.ts` |
| `chromium-owner` | `owner.json` | `owner*` / `mypage*` |
| `chromium-guardian` | `guardian.json` | `guardian*` |

## Failure

- Trace: `on-first-retry` (CI retry 시)
- Screenshot / Video: failure only
- `pnpm e2e:report` 또는 `npx playwright show-trace <trace.zip>`
