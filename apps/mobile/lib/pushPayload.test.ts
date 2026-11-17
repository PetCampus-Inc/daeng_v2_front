import { describe, expect, it } from 'vitest';

import { resolvePushDestination } from './pushPayload';

describe('홀딩 설정 푸시 이동', () => {
  it('FCM 문자열 payload의 강아지를 예약 탭에서 선택한다', () => {
    expect(
      resolvePushDestination({
        data: { payloadVersion: '1', type: 'PET_TICKET_HOLD_CREATED', petId: '12' },
      })
    ).toEqual({
      kind: 'guardianReservation',
      petId: '12',
      dedupeKey: 'PET_TICKET_HOLD_CREATED:12',
    });
  });

  it('강아지 ID가 없어도 예약 탭으로 이동한다', () => {
    expect(resolvePushDestination({ payloadVersion: 1, type: 'PET_TICKET_HOLD_CREATED' })).toEqual({
      kind: 'guardianReservation',
      petId: undefined,
      dedupeKey: 'PET_TICKET_HOLD_CREATED:all',
    });
  });
});
