import { describe, expect, test } from 'vitest';

import { filterAttendanceList } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import type { AttendanceStatus } from '@views/owner-daily-page/lib/ownerDailyAttendance';

const dateKey = '2026-11-10';
const kst = (time: string) => new Date(`${dateKey}T${time}:00+09:00`);

interface Pet {
  name: string;
  breed: string;
  status: AttendanceStatus;
  reservedTime: string;
}

const pets: Pet[] = [
  { name: '초코', breed: '사모예드', status: 'NOT_CHECKED_IN', reservedTime: '09:00' },
  { name: '보리', breed: '말티즈', status: 'NOT_CHECKED_IN', reservedTime: '10:00' },
  { name: '초롱', breed: '푸들', status: 'CHECKED_IN', reservedTime: '09:00' },
  { name: '콩이', breed: '말티즈', status: 'ABSENT', reservedTime: '09:00' },
];

const names = (list: Pet[]) => list.map((pet) => pet.name);

describe('등원처리 탭 검색', () => {
  test('검색어 앞뒤 공백을 지우고 이름으로 부분 일치하는 원생만 남긴다', () => {
    const result = filterAttendanceList(pets, { keyword: '  초 ', lateOnly: false, dateKey, now: kst('08:00') });

    expect(names(result)).toEqual(['초코', '초롱']);
  });

  test('견종으로도 부분 일치하는 원생을 남긴다', () => {
    const result = filterAttendanceList(pets, { keyword: '말티', lateOnly: false, dateKey, now: kst('08:00') });

    expect(names(result)).toEqual(['보리', '콩이']);
  });

  test('공백만 입력하면 전체 목록을 그대로 보여 준다', () => {
    const result = filterAttendanceList(pets, { keyword: '   ', lateOnly: false, dateKey, now: kst('08:00') });

    expect(names(result)).toEqual(['초코', '보리', '초롱', '콩이']);
  });
});

describe('지각 토글', () => {
  test('지각 토글을 켜면 등원 전이면서 지각인 원생만 남긴다. 등원 완료·결석 원생은 뺀다', () => {
    // 09:30 → 09:00 예정인 초코는 지각, 10:00 예정인 보리는 아직 아님
    const result = filterAttendanceList(pets, { keyword: '', lateOnly: true, dateKey, now: kst('09:30') });

    expect(names(result)).toEqual(['초코']);
  });

  test('검색어와 지각 토글을 함께 쓰면 두 조건을 모두 만족하는 원생만 남긴다', () => {
    const latePets: Pet[] = [
      { name: '초코', breed: '사모예드', status: 'NOT_CHECKED_IN', reservedTime: '09:00' },
      { name: '보리', breed: '말티즈', status: 'NOT_CHECKED_IN', reservedTime: '09:00' },
    ];

    const result = filterAttendanceList(latePets, { keyword: '말티', lateOnly: true, dateKey, now: kst('10:00') });

    expect(names(result)).toEqual(['보리']);
  });
});
