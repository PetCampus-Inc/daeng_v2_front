import { describe, expect, it } from 'vitest';

import { formatOperatingHoursNote } from './formatOperatingHoursNote';

const operationTime = {
  serviceTags: '',
  weekday: [{ time: '9:00', breakTime: '18:00:00' }],
  weekend: [{ time: '10:00', breakTime: '17:00' }],
  closedDays: ['THURSDAY', 'TUESDAY'],
};

describe('formatOperatingHoursNote', () => {
  it('운영시간이 없으면 안내를 만들지 않는다', () => {
    expect(formatOperatingHoursNote()).toEqual({ hoursLine: null, closedLine: null });
  });

  it('평일·주말 시간을 두 자리로 맞춰 한 줄로 만든다', () => {
    expect(formatOperatingHoursNote(operationTime).hoursLine).toBe('평일 09:00~18:00, 주말 10:00~17:00');
  });

  it('시작이나 끝이 없으면 그 구간은 뺀다', () => {
    expect(
      formatOperatingHoursNote({
        ...operationTime,
        weekday: [{ time: '09:00', breakTime: '' }],
        weekend: [],
      }).hoursLine
    ).toBeNull();
  });

  it('휴무 요일을 월→일 순으로 붙인다', () => {
    expect(formatOperatingHoursNote(operationTime).closedLine).toBe('화요일, 목요일 휴무');
  });

  it('휴무가 없으면 휴무 줄을 만들지 않는다', () => {
    expect(formatOperatingHoursNote({ ...operationTime, closedDays: [] }).closedLine).toBeNull();
  });
});
