---
title: FE 코드 컨벤션 - 협업
date: 2026-11-04
tags: [convention, commit, branch]
---
# FE 코드 컨벤션 - 협업

커밋 메시지와 브랜치 운영·머지 방식을 정한 규칙.

## 목차

- 1. 커밋
- 2. 브랜치
  - 2-1. 이름
  - 2-2. 머지

---

## 1. 커밋

#### 형식

```
<type>: <description>
```

- [Conventional Commits](https://www.conventionalcommits.org/) 준수
- `description`은 한국어로 작성

#### type 종류


| type       | 뜻                 |
| ---------- | ----------------- |
| `feat`     | 새로운 기능            |
| `fix`      | 버그 수정             |
| `docs`     | 문서 변경             |
| `style`    | 코드 포맷팅 (기능 변경 없음) |
| `refactor` | 리팩토링              |
| `perf`     | 성능 개선             |
| `test`     | 테스트 추가/수정         |
| `chore`    | 빌드, 패키지 매니저 설정 등  |
| `ci`       | CI 설정             |
| `build`    | 빌드 시스템 변경         |


#### 예시

```bash
feat: 사용자 프로필 페이지 추가
fix: 로그인 버튼 클릭 오류 수정
docs: README 업데이트
chore: TanStack Query 버전 업데이트
```

---

## 2. 브랜치

### 2-1. 이름

#### 브랜치 종류


| 브랜치        | 용도                             | 만드는 곳  |
| ---------- | ------------------------------ | ------ |
| `main`     | 배포 기준. 직접 커밋하지 않는다             | —      |
| `dev`      | 다음 배포를 모으는 통합 브랜치. 직접 커밋하지 않는다 | —      |
| `hotfix/*` | 배포된 `main`의 긴급 수정              | `main` |


- 그 외 작업 브랜치: `<type>/*` (`dev`에서 생성)
- `type`은 1장 "type 종류" 표를 따름

#### 브랜치 이름

- 형식: `<type>/<kebab-case 설명>`
- 예: `feat/dashboard`, `docs/branch-strategy`

### 2-2. 머지

#### 머지 방식


| 방향                                      | 방식                       |
| --------------------------------------- | ------------------------ |
| 작업 브랜치(`feat`, `fix` 등) → `dev`         | Squash and merge         |
| `dev` → `main`                          | Merge commit (`--no-ff`) |
| `hotfix/*` → `main`, `hotfix/*` → `dev` | Merge commit (`--no-ff`) |


#### 머지 규칙

- 스쿼시 커밋 메시지
  - 커밋 컨벤션 준수
  - 본문에 요약과 주요 변경 기재
  - 이유: 작업 브랜치의 개별 커밋이 `dev`에 남지 않음
- 스쿼시 머지한 브랜치는 이어서 사용하지 않음 (추가 작업은 `dev`에서 새 브랜치 생성)
- `hotfix/*`: `main` 머지 후 `dev`에도 반영 (다음 배포에서 수정 누락 방지)
- 강제 push
  - `main`: 금지
  - `dev`: 팀 합의 후
