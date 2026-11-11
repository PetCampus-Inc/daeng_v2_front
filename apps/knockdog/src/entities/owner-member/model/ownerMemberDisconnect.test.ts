import { describe, expect, it } from 'vitest';

import {
  toDisconnectEligibility,
  type OwnerMemberDisconnectBlockDto,
  type OwnerMemberDisconnectEligibilityDto,
} from './ownerMemberDisconnect';

const createTicketBlock = (expiresOn: string | null): OwnerMemberDisconnectBlockDto => ({
  type: 'TICKET',
  ticket: { name: '모모네 유치원 10회권', remainingCount: 6, expiresOn },
  reservation: null,
});

const createReservationBlock = (time: string): OwnerMemberDisconnectBlockDto => ({
  type: 'RESERVATION',
  ticket: null,
  reservation: { date: '2026-11-20', time, status: '예약 확정' },
});

const createEligibilityDto = (
  blocks: OwnerMemberDisconnectBlockDto[]
): OwnerMemberDisconnectEligibilityDto => ({ canDisconnect: blocks.length === 0, blocks });

describe('해제 불가 시트에 남은 예약·이용권을 보여준다', () => {
  it('예약일과 만료일이 배열로 내려와도 두 사유를 서버 순서대로 날짜와 함께 표시한다', () => {
    const eligibility = toDisconnectEligibility({
      canDisconnect: false,
      blocks: [
        {
          type: 'RESERVATION',
          ticket: null,
          reservation: { date: [2026, 11, 11], time: '20:30', status: '예약 확정' },
        },
        {
          type: 'TICKET',
          ticket: { name: '이용권 이름', remainingCount: 1, expiresOn: [2027, 2, 10] },
          reservation: null,
        },
      ],
    });

    expect(eligibility).toEqual({
      canDisconnect: false,
      bodyKind: 'ticket',
      blocks: [
        { type: 'reservation', dateLabel: '2026.11.11', timeLabel: '오후 8:30' },
        { type: 'ticket', name: '이용권 이름', remainingCount: 1, expiryLabel: '2027.02.10까지' },
      ],
    });
  });

  it('만료일이 없는 이용권은 만료 없음으로, 만료일이 있는 이용권은 그 날짜까지로 표시할 값을 만든다', () => {
    const eligibility = toDisconnectEligibility(
      createEligibilityDto([createTicketBlock(null), createTicketBlock('2026-12-31')])
    );

    expect(eligibility.blocks.map((block) => block.type === 'ticket' && block.expiryLabel)).toEqual([
      '만료 없음',
      '2026.12.31까지',
    ]);
  });

  it('등원 예정 시각을 12시간제로 바꿀 때 00시대는 오전 12시대로, 12시대는 오후 12시대로, 13시 이후는 12를 뺀 오후로 만든다', () => {
    const eligibility = toDisconnectEligibility(
      createEligibilityDto(['00:30', '09:30', '12:00', '13:05'].map(createReservationBlock))
    );

    expect(
      eligibility.blocks.map((block) => block.type === 'reservation' && block.timeLabel)
    ).toEqual(['오전 12:30', '오전 9:30', '오후 12:00', '오후 1:05']);
    expect(eligibility.blocks[0]).toMatchObject({ type: 'reservation', dateLabel: '2026.11.20' });
  });

  it('예약과 이용권이 모두 남아 있으면 이용권 안내 본문을, 예약만 남아 있으면 예약 안내 본문을 고른다', () => {
    const bodyKinds = [
      [createReservationBlock('09:30'), createTicketBlock(null)],
      [createTicketBlock(null)],
      [createReservationBlock('09:30')],
      [],
    ].map((blocks) => toDisconnectEligibility(createEligibilityDto(blocks)).bodyKind);

    expect(bodyKinds).toEqual(['ticket', 'ticket', 'reservation', null]);
  });
});
