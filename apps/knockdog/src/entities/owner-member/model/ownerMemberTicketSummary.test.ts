import { describe, expect, it } from 'vitest';

import { toOwnerMemberTicketSummary } from './ownerMemberTicketSummary';

describe('등록 원생 한 줄의 이용권 정보', () => {
  it('대표 이용권이 있으면 `{이용권명} | {남은 횟수}회·{남은 일수}일 남음`으로 보여준다', () => {
    expect(toOwnerMemberTicketSummary({ name: '20회권', remainingCount: 1, daysLeft: 90 })).toBe(
      '20회권 | 1회·90일 남음'
    );
  });

  it('만료일이 없는 이용권이면 `{이용권명} | {남은 횟수}회 남음`으로 보여준다', () => {
    expect(toOwnerMemberTicketSummary({ name: '20회권', remainingCount: 1, daysLeft: null })).toBe(
      '20회권 | 1회 남음'
    );
  });

  it('이용권명이 10자를 넘으면 10자까지만 보여주고 `...`을 붙인다', () => {
    expect(
      toOwnerMemberTicketSummary({ name: '가나다라마바사아자차카', remainingCount: 5, daysLeft: 10 })
    ).toBe('가나다라마바사아자차... | 5회·10일 남음');
  });

  it('이용권명이 정확히 10자면 줄이지 않는다', () => {
    expect(
      toOwnerMemberTicketSummary({ name: '가나다라마바사아자차', remainingCount: 5, daysLeft: 10 })
    ).toBe('가나다라마바사아자차 | 5회·10일 남음');
  });

  it('이용권이 없거나 모두 만료면 이용권 정보를 보여주지 않는다', () => {
    expect(toOwnerMemberTicketSummary(null)).toBeNull();
  });
});
