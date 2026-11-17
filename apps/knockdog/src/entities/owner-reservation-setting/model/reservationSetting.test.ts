import { describe, expect, it } from 'vitest';

import { reservationSettingDtoSchema, toReservationSetting, toReservationSettingRequest } from './reservationSetting';

const savedDto = {
  weekdayStartTime: '09:00',
  weekdayEndTime: '12:00',
  weekendStartTime: '10:00',
  weekendEndTime: '17:00',
  dailyCapacity: 8,
  operatingInfo: {
    weekdayOpenTime: '9:00',
    weekdayCloseTime: '18:00:00',
    weekendOpenTime: '10:00',
    weekendCloseTime: '17:00',
    closedDays: ['목', '화'],
  },
};

const draft = {
  weekdayStart: '09:00',
  weekdayEnd: '12:00',
  weekendStart: '10:00',
  weekendEnd: '17:00',
  dailyCapacity: '8',
};

describe('toReservationSettingRequest', () => {
  it('등원 시간 4개와 정원을 저장 요청으로 바꾼다', () => {
    expect(toReservationSettingRequest(draft)).toEqual({
      weekdayStartTime: '09:00',
      weekdayEndTime: '12:00',
      weekendStartTime: '10:00',
      weekendEndTime: '17:00',
      dailyCapacity: 8,
    });
  });

  it('정원이 비면 제한 없음으로 보낸다', () => {
    expect(toReservationSettingRequest({ ...draft, dailyCapacity: '' })).toEqual({
      weekdayStartTime: '09:00',
      weekdayEndTime: '12:00',
      weekendStartTime: '10:00',
      weekendEndTime: '17:00',
    });
  });

  it('시간 4개가 없으면 요청을 만들지 않는다', () => {
    expect(toReservationSettingRequest({ ...draft, weekendEnd: null })).toBeNull();
  });

  it('정원이 1보다 작으면 요청을 만들지 않는다', () => {
    expect(toReservationSettingRequest({ ...draft, dailyCapacity: '0' })).toBeNull();
  });
});

describe('toReservationSetting', () => {
  it('저장 이력이 없으면 입력값과 운영 안내를 비운다', () => {
    const dto = reservationSettingDtoSchema.parse({
      weekdayStartTime: null,
      weekdayEndTime: null,
      weekendStartTime: null,
      weekendEndTime: null,
      dailyCapacity: null,
      operatingInfo: {
        weekdayOpenTime: null,
        weekdayCloseTime: null,
        weekendOpenTime: null,
        weekendCloseTime: null,
        closedDays: [],
      },
    });

    expect(toReservationSetting(dto)).toEqual({
      weekdayStart: null,
      weekdayEnd: null,
      weekendStart: null,
      weekendEnd: null,
      dailyCapacity: '',
      hoursLine: null,
      closedLine: null,
    });
  });

  it('등원 시간과 정원을 화면 값으로 바꾸고 운영 안내는 읽기 전용으로 만든다', () => {
    expect(toReservationSetting(reservationSettingDtoSchema.parse(savedDto))).toEqual({
      weekdayStart: '09:00',
      weekdayEnd: '12:00',
      weekendStart: '10:00',
      weekendEnd: '17:00',
      dailyCapacity: '8',
      hoursLine: '평일 09:00~18:00, 주말 10:00~17:00',
      closedLine: '화요일, 목요일 휴무',
    });
  });
});
