import { describe, expect, it } from 'vitest';

import { parseGuardianTicketCard, parseGuardianTicketManage, toGuardianTicketCard, toGuardianTicketManage } from './guardianTicket';

const ticket = {
  ticketId: 12,
  schoolId: 3,
  schoolName: '양파빵 유치원',
  name: '정기권 10회',
  status: 'IN_USE',
  remainingCount: 8,
  chargeCount: 10,
  startDate: [2026, 8, 1],
  expiresOn: '2026-11-30',
  daysLeft: 2,
  showDDay: true,
  hold: null,
  expiredReason: null,
  expiredOn: null,
  reservable: true,
};

describe('toGuardianTicketCard', () => {
  it('사용 중 이용권과 연결 상태를 화면 모델로 바꾼다', () => {
    const card = toGuardianTicketCard(
      parseGuardianTicketCard({
        data: {
          connection: 'CONNECTED',
          school: { schoolId: 3, name: '양파빵 유치원', address: '서울시 강남구', thumbnailImageUrl: null },
          manageCount: 2,
          tickets: [ticket],
        },
      })
    );

    expect(card.connection).toBe('connected');
    expect(card.school).toEqual({ id: '3', name: '양파빵 유치원', address: '서울시 강남구' });
    expect(card.tickets[0]).toMatchObject({
      id: '12',
      status: 'active',
      startsOn: '2026-08-01',
      endsOn: '2026-11-30',
      remainingCount: 8,
      totalCount: 10,
      showDDay: true,
    });
  });

  it('슬래시 날짜는 응답 오류로 본다', () => {
    expect(() =>
      parseGuardianTicketCard({
        data: {
          connection: 'CONNECTED',
          school: null,
          manageCount: 1,
          tickets: [{ ...ticket, startDate: '2026/08/01' }],
        },
      })
    ).toThrow();
  });
});

describe('toGuardianTicketManage', () => {
  it('홀딩 이용권은 비활성화 묶음에 둔다', () => {
    const manage = toGuardianTicketManage(
      parseGuardianTicketManage({
        data: {
          available: [],
          inactive: [
            {
              ...ticket,
              status: 'HOLDING',
              reservable: false,
              hold: { startDate: '2026-10-30', endDate: '2026-11-10', daysAfterHold: 20 },
            },
          ],
          expired: [],
        },
      })
    );

    expect(manage.inactive[0]).toMatchObject({
      status: 'onHold',
      hold: { startsOn: '2026-10-30', endsOn: '2026-11-10' },
    });
  });
});
