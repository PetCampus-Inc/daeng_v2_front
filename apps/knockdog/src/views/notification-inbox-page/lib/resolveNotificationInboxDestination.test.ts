import { describe, expect, it } from 'vitest';

import { resolveNotificationInboxDestination } from './resolveNotificationInboxDestination';

const GUARDIAN_TICKET_TYPES = [
  'PET_TICKET_CHARGED',
  'PET_TICKET_HOLD_CANCELED',
  'PET_TICKET_HOLD_ENDED',
  'PET_TICKET_EXPIRY_EXTENDED',
  'PET_TICKET_EXPIRING',
];

describe('resolveNotificationInboxDestination ticket', () => {
  it('보호자 이용권 알림은 payload가 없어도 예약 탭으로 간다', () => {
    for (const type of GUARDIAN_TICKET_TYPES) {
      expect(resolveNotificationInboxDestination(type)).toEqual({ kind: 'guardianReservation' });
    }
  });

  it('petId가 있으면 예약 탭에서 그 강아지를 고른다', () => {
    expect(resolveNotificationInboxDestination('PET_TICKET_CHARGED', { petId: 12 })).toEqual({
      kind: 'guardianReservation',
      petId: '12',
    });
  });

  it('원장 만료 예정은 구성원 만료예정으로 간다', () => {
    expect(resolveNotificationInboxDestination('PET_TICKET_EXPIRING_OWNER')).toEqual({
      kind: 'ownerExpiringMembers',
    });
  });

  it('등원 리마인드는 예약 상세로 간다', () => {
    expect(resolveNotificationInboxDestination('RESERVATION_REMINDER', { petId: 3, reservationId: 9 })).toEqual({
      kind: 'guardianReservationDetail',
      petId: '3',
      reservationId: '9',
    });
  });

  it('예약 번호가 없으면 리마인드는 이동하지 않는다', () => {
    expect(resolveNotificationInboxDestination('RESERVATION_REMINDER', { petId: 3 })).toEqual({ kind: 'unavailable' });
  });

  it('이용권 1회·시작 알림은 예약 탭으로 간다', () => {
    expect(resolveNotificationInboxDestination('PET_TICKET_ONE_LEFT', { petId: '4' })).toEqual({
      kind: 'guardianReservation',
      petId: '4',
    });
    expect(resolveNotificationInboxDestination('PET_TICKET_STARTED')).toEqual({ kind: 'guardianReservation' });
  });

  it('이용권을 모두 쓰면 그 이용권 상세로 간다', () => {
    expect(resolveNotificationInboxDestination('PET_TICKET_EXHAUSTED', { petId: 4, ticketId: 8 })).toEqual({
      kind: 'guardianTicketDetail',
      petId: '4',
      ticketId: '8',
    });
  });

  it('이용권 번호가 없으면 소진 알림은 이동하지 않는다', () => {
    expect(resolveNotificationInboxDestination('PET_TICKET_EXHAUSTED', { petId: 4 })).toEqual({ kind: 'unavailable' });
  });

  it('원장이 연결을 해제하면 연결 이력으로 간다', () => {
    expect(resolveNotificationInboxDestination('SCHOOL_MEMBERSHIP_DISCONNECTED', { petId: 2 })).toEqual({
      kind: 'guardianConnectionHistory',
    });
  });

  it('보호자가 연결을 해제하면 원장 구성원 목록으로 간다', () => {
    expect(resolveNotificationInboxDestination('GUARDIAN_DISCONNECTED')).toEqual({ kind: 'ownerMembers' });
    expect(resolveNotificationInboxDestination('GUARDIAN_MEMBERSHIP_DISCONNECTED')).toEqual({ kind: 'ownerMembers' });
  });
});

describe('알림으로 일과 열기', () => {
  it('원장 지각 알림을 누르면 일과 `등원처리` 탭이 지각 토글이 켜진 상태로 열리는 곳으로 이동한다', () => {
    expect(
      resolveNotificationInboxDestination('ATTENDANCE_LATE_OWNER', {
        payloadVersion: 1,
        schoolId: 3,
        date: '2026-11-10',
      })
    ).toEqual({ kind: 'ownerDailyLate' });
  });

  it('보호자 지각 알림을 누르면 유치원 탭에서 해당 강아지가 선택된 곳으로 이동한다', () => {
    expect(
      resolveNotificationInboxDestination('ATTENDANCE_LATE_GUARDIAN', {
        payloadVersion: 1,
        schoolId: 3,
        petId: 12,
        date: '2026-11-10',
        reservationId: 99,
      })
    ).toEqual({ kind: 'guardianKindergarten', petId: '12', date: '2026-11-10' });
  });

  it('보호자 결석 취소 알림을 누르면 유치원 탭으로 이동한다', () => {
    expect(
      resolveNotificationInboxDestination('ATTENDANCE_CANCEL_ABSENT', {
        payloadVersion: 1,
        schoolId: 3,
        petId: 12,
        date: '2026-11-10',
        reservationId: 99,
      })
    ).toEqual({ kind: 'guardianKindergarten', petId: '12', date: '2026-11-10' });
  });
});
