# [KD3-713] 원장 연결 해제 — 백엔드 확인 요청

원장 앱 `원생 프로필`의 `연결해제`를 만드는 중인데, 이용권·예약이 남은 원생은 보호자와 같은 조건으로 해제를 막아야 해서 현재 API로는 알 수 없는 것 2가지를 여쭤봅니다.

물어볼 사람: Minje Kang

답변 받은 날: 2026-11-09

---

## 1. 원장용 해제 가능 여부 조회
- 대상 API
  - 원장용 해제 가능 여부 조회 API (아직 없음. 보호자용 `GET /api/v0/guardian/school/connections/{schoolPetMembershipId}/disconnect-eligibility`는 dev에 있습니다)
- 현재: 원장이 원생의 남은 이용권·끝나지 않은 예약을 한 번에 확인할 방법이 없습니다. 이용권은 `GET /api/v0/owner/pets/{petId}/tickets`로 볼 수 있지만, 예약은 원장용 조회가 없습니다.
- 필요: 연결해제를 누르면 이용권(사용 예정·사용 중·홀딩 중)과 끝나지 않은 예약이 남았는지 확인하고, 안내 창에 이용권 이름·잔여 횟수·만료일과 예약 날짜·등원 예정 시간·상태를 보여줘야 합니다. 이용권과 예약이 둘 다 남아 있으면 두 목록을 모두 보여줍니다(예약 먼저).
- 요청&질문
  - 보호자용과 같은 공용 검사로 원장용 조회 API를 추가해주세요! (`memberId` 또는 `petId` 기준)
- 답변
  - `GET /api/v0/owner/members/{memberId}/disconnect-eligibility` (`memberId`는 구성원 목록의 값)
  - 응답: `{ canDisconnect, blocks[] }`
  - `blocks`에 끝나지 않은 예약(`RESERVATION`)이 먼저, 남은 이용권(`TICKET`)이 뒤에 옵니다. 둘 다 있으면 모두 내려갑니다.
  - 이용권: `name`, `remainingCount`, `expiresOn`(만료 없으면 `null`)
  - 예약: `date`, `time`(`HH:mm`), `status`
  - 당일 등원 기록은 원장 해제를 막지 않습니다.
  - 결과가 시점마다 바뀌니 캐시하지 마세요.

## 2. 원장 해제 API의 이용권·예약 검사
- 대상 API
  - `POST /api/v0/owner/members/{memberId}/disconnect` (구성원 연결 해제)
- 참고: 보호자 해제는 이용권·예약이 남으면 409 `GUARDIAN_SCHOOL_CONNECTION-409-2`로 막습니다.
- 현재: `OwnerMemberService.disconnectMember`는 연결 상태만 확인하고, 149번째 줄 주석이 `원장 해제는 PRD상 사전 조건 검사가 없다`고 적혀 있습니다.
- 필요: 노션 PRD에서는 원장 해제도 보호자와 같은 조건을 따릅니다. 확인 창을 띄운 사이 보호자가 예약하거나 이용권이 충전될 수 있어서, 해제를 처리하는 순간에도 서버가 다시 확인해야 합니다.
- 요청&질문
  - 원장 해제 API 검토 부탁드리고, 이 조건에 걸리면 어떤 오류 코드를 주게 되나요?
- 답변
  - `POST /api/v0/owner/members/{memberId}/disconnect`가 처리 직전에 같은 검사를 다시 합니다.
  - 이용권·예약이 남아 있으면 409 `OWNER_MEMBER-409-3`을 반환하고 해제하지 않습니다.
  - 이미 해제된 구성원은 기존대로 400 `OWNER_MEMBER-400-2`입니다.
  - 409 응답에는 사유가 없으니, 사유는 1번 조회 API로 확인해 주세요.