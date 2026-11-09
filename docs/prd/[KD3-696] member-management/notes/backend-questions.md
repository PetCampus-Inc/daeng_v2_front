# [KD3-696] 구성원 관리 — 백엔드 확인 요청

원장 앱 `구성원` 화면(Figma `V.4.0_원장-구성원`)을 만드는 중인데, 화면에 필요한 값이 현재 API 응답에 없어서 4가지를 요청·질문했습니다. 답변은 각 항목의 `답변`에 적었습니다(백엔드 답변, 2026-11-09).

---

## 1. 성별·보호자 연락처

대상 API

- `GET /api/v0/owner/members` (등록 원생 목록)
- `GET /api/v0/owner/members/pending` (신청 목록)

- 현재: 두 응답에 `memberId`, `petId`, `dogName`, `guardianName`, `profileImageUrl`(등록 원생 목록은 `lastAttendanceAt`도)만 있습니다.
- 필요: 목록 한 줄에 강아지 성별 아이콘과 `{보호자 이름} 보호자 · 010-0000-0000` 형식의 연락처를 보여줍니다.
- 요청&질문
  - 두 응답에 원생 성별과 보호자 연락처를 추가해주세요!
  - 연락처는 하이픈을 포함해서 내려주나요?
- 답변
  - 두 API 응답에 모두 `gender`를 추가했습니다.
  - 연락처 `guardianPhoneNumber`는 등록 원생 목록(`/members`)에 추가했습니다.
  - 하이픈은 포함돼서 내려갑니다. 보호자가 프로필을 저장할 때 `010-1234-5678` 형식만 허용하고, 서버가 그 값을 그대로 줍니다.
  - 값이 없으면 `null`입니다.

## 2. 목록의 이용권 정보

대상 API

- `GET /api/v0/owner/members` (등록 원생 목록)
- 참고: `GET /api/v0/owner/pets/{petId}/tickets` (KD3-695, 아직 dev 병합 전)

- 현재: 목록 응답에 이용권 정보가 없습니다. 이용권은 원생별 이용권 API로만 볼 수 있습니다.
- 필요: 목록 한 줄에 `1회 남음` / `D-n` / `만료` 배지와 `20회권.. | 1회·90일 남음` 같은 이용권 정보를 보여주고, `만료예정`·`만료` 칩으로 걸러서 보여줍니다.
- 요청&질문
  - 목록 응답에 원생별 이용권 요약(대표 이용권의 이름·잔여 횟수·만료일·상태)을 추가해주세요!
- 답변
  - `/members` 각 항목에 `ticketState`(`NONE`/`VALID`/`EXPIRING`/`EXPIRED`), `expiringReason`(`REMAINING_ONE`/`DAYS_LEFT`), `ticket`을 추가했습니다.
  - `ticket`은 `{ticketId, name, status, remainingCount, chargeCount, expiresOn, daysLeft}`입니다.
  - 대표 이용권은 만료 안 된 이용권 중 가장 최근에 충전한 것입니다. `NONE`/`EXPIRED`일 때는 `ticket`이 `null`입니다.
  - 만료예정은 잔여 1회이거나 만료까지 3일 이하입니다. 둘 다 해당하면 `DAYS_LEFT`(D-n)만 줍니다.
  - 칩 개수는 `counts{all, expiring, expired}`로 내려갑니다. 거를 때는 `filter=ALL|EXPIRING|EXPIRED`를 씁니다. `counts`는 검색어·칩과 무관한 유치원 전체 기준입니다.

## 3. 견종 검색

대상 API

- `GET /api/v0/owner/members?keyword=` (등록 원생 목록 검색)

- 현재: 강아지 이름과 보호자 이름만 검색하고, 견종은 응답에도 검색에도 없습니다.
- 필요: 검색창 문구가 `이름 혹은 견종을 입력해 주세요`라서 견종으로도 검색해야 합니다.
- 요청&질문
  - 견종을 응답과 검색 대상에 추가해주세요!
- 답변
  - `breed`를 응답에 추가했고, `keyword`는 원생 이름·견종으로 검색합니다.
  - 보호자 이름 검색은 빠졌습니다.

## 4. 신청 목록 정렬

대상 API

- `GET /api/v0/owner/members/pending` (신청 목록)

- 현재: 응답에 신청 일시가 없고 정렬 파라미터도 없습니다. 서버가 이름순(한글 우선)으로만 내려줍니다.
- 필요: 정렬 기준이 `최신순`(기본) / `이름순` / `오래된순` 3가지입니다.
- 요청&질문
  - 요청에 정렬 기준 파라미터를 추가해주세요!
- 답변
  - `/pending`에 `sort=LATEST|NAME|OLDEST`를 추가했습니다. 기본은 `LATEST`(최신순)이고, 이름순은 한글 우선입니다.
  - 응답에 신청 일시 필드는 따로 추가하지 않았습니다. 정렬은 서버가 처리합니다.
  - 신청 탭 배지용으로 `pendingCount`를 `/members`와 `/pending` 둘 다 내려줍니다. 둘 다 검색과 무관한 전체 신청 수입니다.
