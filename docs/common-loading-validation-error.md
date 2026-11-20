# 공통 로딩/검사/오류 정책

# 📌 공통 로딩 정책

## 1. 공통 컴포넌트

공통 로딩 컴포넌트는 아래 경로에서 제공합니다.

```
apps/knockdog/src/shared/ui/loading-spinner
apps/knockdog/src/shared/ui/skeleton
```

사용 가능한 컴포넌트:

- `LoadingSpinner`: 기본 Spinner
- `DelayedLoadingSpinner`: 일정 시간 이후 Spinner 표시
- `ActionLoadingOverlay`: 등록·수정·삭제 등 액션 진행 중 화면 잠금
- `InfiniteScrollFooter`: 리스트 추가 조회 Spinner
- `RingLoadingSpinner`: 업로드 모달 등에서 사용
- `Skeleton`: 콘텐츠 영역 Skeleton

```tsx
import {
  ActionLoadingOverlay,
  DelayedLoadingSpinner,
  InfiniteScrollFooter,
} from '@shared/ui/loading-spinner';
import { Skeleton } from '@shared/ui/skeleton';
```

## 2. 페이지 진입 로딩

페이지 전체를 교체하지 않고 Header와 GNB를 유지한 상태에서 콘텐츠 영역에 표시합니다.

```tsx
<Header />

<DelayedLoadingSpinner
  isLoading={query.isLoading}
  layout='content'
/>
```

지원하는 레이아웃:

- `inline`: 버튼 주변이나 리스트 하단
- `content`: Header/GNB를 제외한 콘텐츠 중앙
- `screen`: 전체 화면 중앙

현재 대부분의 초기 조회는 Spinner가 즉시 노출됩니다. 250~300ms 이후 노출 정책은 일부 갱신 화면에만 적용되어 있어 추후 공통 상수 조정이 필요합니다.

## 3. 로딩 지연 시간

관련 설정:

```
apps/knockdog/src/shared/ui/loading-spinner/lib/constants.ts
```

현재 설정:

```tsx
const LOADING_SPINNER_DELAY_MS = 0;
const ACTION_LOADING_DELAY_MS = 0;
const REFRESH_LOADING_DELAY_MS = 250;
```

목표 정책:

- 페이지 진입 및 초기 조회: 250ms 이상 지연 시 표시
- 기존 콘텐츠 갱신: 250ms 이상 지연 시 표시
- 등록·수정·삭제: 요청 즉시 버튼 잠금, 250ms 이상 지속 시 Spinner 표시
- 파일 업로드: 즉시 Spinner 표시

## 4. API 타임아웃

타임아웃은 공통 API 설정에 정의되어 있습니다.

```
apps/knockdog/src/shared/api/config/timeouts.ts
```

현재 기준:

- 일반 조회·등록·수정·삭제: 15초
- 로그인·인증: 10초
- 이미지·파일 업로드: 60초

Timeout은 다음 `ApiError`로 변환됩니다.

```tsx
new ApiError(408, 'TIMEOUT', '요청을 처리하지 못했습니다.');
```

## 5. 리스트 추가 조회

Infinite Scroll은 공통 훅과 컴포넌트를 사용합니다.

```tsx
import { useInfiniteScroll } from '@shared/lib';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';
```

```tsx
<InfiniteScrollFooter
  isFetchingNextPage={query.isFetchingNextPage}
  hasNextPage={query.hasNextPage}
  ref={lastElementRef}
/>
```

- 기존 목록은 유지합니다.
- 리스트 하단에 Spinner를 표시합니다.
- 추가 조회 완료 또는 실패 시 Spinner를 제거합니다.
- 중복 추가 조회를 실행하지 않습니다.

## 6. 사용자 액션

등록·수정·삭제·저장 요청 중에는 동일 요청을 차단합니다.

```tsx
<ActionButton
  disabled={!canSubmit || mutation.isPending}
  onClick={handleSubmit}
>
  저장하기
</ActionButton>

<ActionLoadingOverlay isPending={mutation.isPending} />
```

필수 처리:

- 클릭 즉시 CTA 비활성화
- 동일 mutation 중복 실행 방지
- 성공 또는 실패 시 로딩 종료
- 실패 시 입력값 유지
- 재시도가 가능해지면 CTA 다시 활성화

## 7. Skeleton

Skeleton은 다음 경로에서 제공합니다.

```
apps/knockdog/src/shared/ui/skeleton
```

현재 이미지 업로드, 썸네일, 일부 상세 화면에서 사용합니다.

앨범과 알림장은 이미지 로딩 전후 레이아웃 변경을 방지하기 위해 이미지 영역의 크기 또는 `aspect-ratio`를 미리 확보하고 있습니다.

---

# 📌 입력값 및 유효성 검사 정책

## 1. 공통 입력 컴포넌트

공통 입력 UI는 `@knockdog/ui`에서 제공합니다.

```tsx
import { Field, TextField, Textarea } from '@knockdog/ui';
```

주요 기능:

- Label
- 필수 여부 표시
- `invalid` 상태
- 인라인 오류 문구
- 입력 설명
- 비활성화 상태

공통 컴포넌트는 오류 표현만 담당하며 실제 정규화와 검증은 각 도메인에서 처리합니다.

## 2. 현재 검증 구조

현재 `react-hook-form`과 `zod`가 설치되어 있습니다.

```
react-hook-form
zod
@hookform/resolvers
```

다만 모든 폼에 공통 적용된 상태는 아닙니다.

- 주소 관련 일부 화면: Zod
- 원장·반려견 프로필: React Hook Form rules
- 유치원 등록·수정: `useState`와 formatter
- 리뷰·메모·신고: `maxLength` 중심의 수동 검증

## 3. 현재 도메인별 유틸

### 보호자 입력

```
apps/knockdog/src/features/guardian-profile-form
```

- 보호자 이름
- 휴대전화
- 비상 연락처
- 상세 주소

### 원장·유치원 입력

```
apps/knockdog/src/features/role-conversion/lib/formatKindergartenRegisterField.ts
```

- 대표자명
- 유치원명
- 전화번호
- 이메일
- 주소

### 강아지 프로필

```
apps/knockdog/src/features/dog-profile/lib
```

- 강아지 이름
- 몸무게

## 4. 공통 입력 처리 기준

신규 입력 화면은 다음 순서로 처리합니다.

```
입력 → 허용 문자 필터링 → 길이 제한 → 정규화 → 유효성 검사 → API 요청
```

필수 기준:

- 필수값이 비어 있으면 CTA 비활성화
- 선택값의 빈값은 유효한 상태로 처리
- 허용하지 않는 문자와 최대 길이 초과 입력은 입력 단계에서 차단
- 형식 오류는 필드 이탈 시 인라인 오류 표시
- 값이 유효해지면 오류를 즉시 해제
- API 요청 전 문자열 앞뒤 공백 제거
- 자유 텍스트는 허용된 줄바꿈과 내부 공백 유지

## 5. 현재 정리가 필요한 항목

현재 다음 검증은 화면별로 구현이 나뉘어 있습니다.

- 상세 주소 최대 길이 및 이모지 처리
- 보호자와 원장 휴대전화 형식
- 이름 허용 문자
- URL 검증
- 이메일 검증
- 자유 텍스트 정규화
- 글자 수 계산 기준

신규 화면에서 별도 정규식을 추가하기 전에 기존 도메인 유틸을 확인합니다. 추후 `shared/input-validation` 형태로 통합 처리가 필요합니다.

---

# 📌 공통 오류 정책

## 1. 공통 API 오류

공통 API 클라이언트는 아래 경로에 있습니다.

```
apps/knockdog/src/shared/api
```

서버의 non-2xx 응답은 다음 형태의 `ApiError`로 변환됩니다.

```tsx
class ApiError extends Error {
  status: number;
  code: string;
  message: string;
}
```

```tsx
import { ApiError } from '@shared/api';

if (error instanceof ApiError) {
  console.log(error.status);
  console.log(error.code);
}
```

## 2. 조회 실패

공통 조회 오류 화면은 `PageError`를 사용합니다.

![PageError 화면](page-error.png)

```tsx
import { PageError } from '@shared/ui/page-error';

if (query.isError) {
  return (
    <PageError
      onRetry={() => query.refetch()}
      isRetrying={query.isFetching}
    />
  );
}
```

- 이미지: `/images/img_404.webp`
- 제목: `정보를 불러오지 못했어요`
- 설명: `잠시 후 다시 시도해 주세요.`
- CTA: `다시 시도하기`
- `inline`: Header/GNB 유지, 본문 영역만 오류 표시
- `overlay`: Header까지 덮는 전체 오류 표시

처리 기준:

- 최초 필수 데이터 조회 실패: 콘텐츠 영역을 오류 화면으로 교체
- Header와 GNB 유지
- 다시 시도 시 필수 데이터 재조회
- 재조회 중 중복 클릭 방지
- 실패 시 오류 화면 유지
- 성공 시 정상 콘텐츠 표시

## 3. 액션 실패

등록·수정·삭제·업로드 실패는 전체 오류 화면으로 전환하지 않습니다.

- 현재 화면 유지
- 입력값과 선택값 유지
- Toast 또는 Dialog로 오류 안내
- CTA 다시 활성화
- 필요하면 다시 시도 제공

```tsx
try {
  await mutation.mutateAsync(payload);
} catch (error) {
  setFailureDialogOpen(true);
}
```

## 4. 인증 오류

현재 공통 API 인터셉터에서 처리합니다.

- 액세스 토큰 만료: 토큰 갱신 후 요청 재실행
- 리프레시 토큰 만료: 로그아웃 후 로그인 화면 이동
- 이전 세션의 늦은 401 응답은 현재 세션에 영향을 주지 않음

## 5. 오류 코드 분기

기능별 처리가 필요한 경우 HTTP status보다 서버의 `code`를 우선 사용합니다.

```tsx
if (
  error instanceof ApiError &&
  error.code === 'ALREADY_PROCESSED'
) {
  await query.refetch();
}
```

- `status`: 공통 오류 범주 판정
- `code`: 기능별 UX 분기
- `message`: 사용자 안내 fallback
- 오류 message 문자열을 파싱하여 분기하지 않음

## 6. React Query 재시도

현재 query와 mutation의 자동 재시도는 비활성화되어 있습니다.

```tsx
queries: {
  retry: 0,
  retryOnMount: false,
},
mutations: {
  retry: 0,
}
```

사용자가 `다시 시도`를 선택한 경우에만 요청을 다시 실행합니다.

## 7. 현재 수정 필요한 항목

다음 항목은 아직 전역 공통으로 처리되지 않습니다.

- 서버 점검 화면
- 강제 업데이트 차단 화면
- 403 권한 없음 공통 화면
- 429 Rate Limit 처리
- 전역 오프라인 감지
- JSON이 아닌 오류 응답 fallback
- Next.js `error.tsx`, `global-error.tsx`
- 필수 API 묶음의 부분 실패 판정
- 전역 QueryCache/MutationCache 오류 처리

---