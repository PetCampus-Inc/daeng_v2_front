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
});
