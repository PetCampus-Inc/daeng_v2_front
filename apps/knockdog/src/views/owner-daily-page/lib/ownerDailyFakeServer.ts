import { vi } from 'vitest';

import type {
  AttendanceCheckinoutCandidateDto,
  AttendanceCheckinoutSummaryDto,
  AttendanceCheckinoutTodayDto,
  AttendanceCheckinoutTodayItemDto,
  CheckinoutStatus,
  TodayAttendanceFilter,
} from '@entities/owner-attendance-checkinout';

import { ApiError } from '@shared/api';
import { getKstDateKey } from '@shared/lib/calendar-date';

/**
 * 일과 화면 컴포넌트 테스트용 가짜 서버.
 *
 * 사용법
 * 1. 테스트 파일에서 서버 호출 모듈을 이 파일의 `fakeAttendanceApi`로 바꾼다.
 *    vi.mock('@entities/owner-attendance-checkinout/api/attendanceCheckinout', async () => {
 *      const { fakeAttendanceApi } = await import('@views/owner-daily-page/lib/ownerDailyFakeServer');
 *      return { ...fakeAttendanceApi };
 *    });
 * 2. `beforeEach`에서 `fakeAttendanceServer.reset()`을 부르고, `seedDay(날짜, 원생들)`로 날짜별 데이터를 넣는다.
 * 3. 처리 API(등원·결석·하원과 취소)는 "오늘" 원생의 상태를 실제로 바꾸고, 다음 조회에 그대로 반영된다.
 *    허용되지 않는 상태면 `ATTENDANCE_CHECKINOUT-409-1`, 예약이 없으면 `ATTENDANCE_CHECKINOUT-409-4`로 거절한다(ApiError).
 *    등원 취소는 이미 하원 처리됐으면 `409-2`, 알림장이 발송됐으면 `409-3`으로 거절한다(하원 처리가 먼저).
 *    등원목록 조회는 `filter`(재원중·발송전)를 서버처럼 적용하고, 연결 해제(`disconnected`)·알림장 발송(`attendanceRecordSent`) 원생을 시드할 수 있다.
 * 4. `failNextRead(이름)`으로 다음 한 번의 조회(현황·등원 대상·등원목록)를 실패시킨다.
 * 5. `failNextAction(이름, 코드)`로 다음 한 번의 처리 요청을 실패시키고, `holdActions()`로 처리 요청을 붙잡아 둘 수 있다.
 */

interface FakePet {
  petId: number;
  name: string;
  breed: string;
  reservedTime: string;
  status: CheckinoutStatus;
  requestMemo: string | null;
  firstAttendance: boolean;
  profileImage: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
  disconnected: boolean;
  attendanceRecordSent: boolean;
}

interface FakeServerSettings {
  totalMemberCount: number;
  /** 하루 정원. null이면 제한 없음 */
  dailyCapacity: number | null;
  reservationSettingConfigured: boolean;
}

type ActionName =
  | 'postAttendanceCheckIn'
  | 'postAttendanceAbsent'
  | 'postAttendanceCheckOut'
  | 'postAttendanceCancelCheckIn'
  | 'postAttendanceCancelAbsent'
  | 'postAttendanceCancelCheckOut';

type ReadName = 'summary' | 'candidates' | 'today' | 'members';

const DEFAULT_SETTINGS: FakeServerSettings = {
  totalMemberCount: 10,
  dailyCapacity: null,
  reservationSettingConfigured: true,
};

let nextPetId = 1;
let settings: FakeServerSettings = { ...DEFAULT_SETTINGS };
let petsByDate = new Map<string, FakePet[]>();
let injectedFailures = new Map<ActionName, string>();
let injectedReadFailures = new Set<ReadName>();
let heldActions: Promise<void> | null = null;

/** 가짜 원생 한 명을 만든다. 넘기지 않은 값은 등원 전·예약 09:00 기본값이다. */
const createFakePet = (overrides: Partial<FakePet> = {}): FakePet => {
  const petId = overrides.petId ?? nextPetId++;

  return {
    petId,
    name: `원생${petId}`,
    breed: '말티즈',
    reservedTime: '09:00',
    status: 'NOT_CHECKED_IN',
    requestMemo: null,
    firstAttendance: false,
    profileImage: null,
    checkInAt: null,
    checkOutAt: null,
    disconnected: false,
    attendanceRecordSent: false,
    ...overrides,
  };
};

const toDto = (pet: FakePet): AttendanceCheckinoutCandidateDto => ({
  petId: pet.petId,
  name: pet.name,
  breed: pet.breed,
  gender: null,
  weight: null,
  profileImage: pet.profileImage,
  reservationId: pet.petId,
  reservedTime: pet.reservedTime,
  requestMemo: pet.requestMemo,
  firstAttendance: pet.firstAttendance,
  status: pet.status,
  checkInAt: pet.checkInAt,
  checkOutAt: pet.checkOutAt,
});

const toTodayItemDto = (pet: FakePet): AttendanceCheckinoutTodayItemDto => ({
  ...toDto(pet),
  disconnected: pet.disconnected,
  attendanceRecordSent: pet.attendanceRecordSent,
  attendanceRecordId: pet.attendanceRecordSent ? pet.petId : null,
});

const compareByTimeAndName = (first: FakePet, second: FakePet) =>
  first.reservedTime.localeCompare(second.reservedTime) || first.name.localeCompare(second.name, 'ko');

const getTodayKey = () => getKstDateKey(new Date());

const getPets = (dateKey: string) => petsByDate.get(dateKey) ?? [];

const createResponse = <T>(data: T) => ({ status: 200, code: 'OK', message: '', data });

/** 서버가 주는 오류와 같은 모양(ApiError)으로 거절한다. */
const rejectWith = (status: number, code: string) => Promise.reject(new ApiError<string>(status, code, code));

/** `failNextRead`로 예약된 조회면 한 번만 실패시킨다. 아니면 null이다. */
const takeInjectedReadFailure = (name: ReadName) => {
  if (!injectedReadFailures.delete(name)) return null;

  return rejectWith(500, 'UNKNOWN_ERROR');
};

const getSummary = ({ date }: { date?: string } = {}) => {
  const failure = takeInjectedReadFailure('summary');
  if (failure) return failure;

  const pets = getPets(date ?? getTodayKey());
  const countOf = (statuses: CheckinoutStatus[]) => pets.filter((pet) => statuses.includes(pet.status)).length;

  const data: AttendanceCheckinoutSummaryDto = {
    reservationSettingConfigured: settings.reservationSettingConfigured,
    dailyCapacity: settings.dailyCapacity,
    reservedCount: pets.length,
    checkedInCount: countOf(['CHECKED_IN', 'CHECKED_OUT']),
    absentCount: countOf(['ABSENT']),
    checkedOutCount: countOf(['CHECKED_OUT']),
    notCheckedOutCount: countOf(['CHECKED_IN']),
  };

  return Promise.resolve(createResponse(data));
};

const getCandidates = ({ date }: { date?: string } = {}) => {
  const failure = takeInjectedReadFailure('candidates');
  if (failure) return failure;

  const pets = getPets(date ?? getTodayKey()).filter((pet) => !pet.disconnected);
  // 서버가 정렬해서 준다: 등원 전 원생이 위, 처리한 원생이 아래. 각 묶음은 예정 시간 → 이름순
  const notCheckedIn = pets.filter((pet) => pet.status === 'NOT_CHECKED_IN').sort(compareByTimeAndName);
  const processed = pets.filter((pet) => pet.status !== 'NOT_CHECKED_IN').sort(compareByTimeAndName);
  const items = [...notCheckedIn, ...processed].map(toDto);

  return Promise.resolve(createResponse({ totalCount: items.length, items }));
};

const getToday = ({ date, filter }: { date?: string; filter?: TodayAttendanceFilter } = {}) => {
  const failure = takeInjectedReadFailure('today');
  if (failure) return failure;

  const dateKey = date ?? getTodayKey();
  const isPast = dateKey < getTodayKey();
  const pets = getPets(dateKey)
    .filter((pet) => pet.status === 'CHECKED_IN' || pet.status === 'CHECKED_OUT' || (isPast && pet.status === 'ABSENT'))
    .sort(compareByTimeAndName);

  const matchesFilter = (pet: FakePet) => {
    if (filter === 'CURRENTLY_IN') return pet.status === 'CHECKED_IN';
    if (filter === 'UNSENT_RECORD') return !pet.attendanceRecordSent;
    if (filter === 'ABSENT') return pet.status === 'ABSENT';
    return true;
  };

  const data: AttendanceCheckinoutTodayDto = {
    totalCount: pets.filter(matchesFilter).length,
    counts: {
      all: pets.length,
      currentlyIn: pets.filter((pet) => pet.status === 'CHECKED_IN').length,
      unsentRecord: pets.filter((pet) => !pet.attendanceRecordSent).length,
      absent: pets.filter((pet) => pet.status === 'ABSENT').length,
    },
    items: pets.filter(matchesFilter).map(toTodayItemDto),
  };

  return Promise.resolve(createResponse(data));
};

/** 처리 API 하나를 만든다. 오늘 원생의 상태를 `nextStatus`로 바꾼다. 허용되지 않는 상태에서는 409로 거절한다. */
const createAction = (
  name: ActionName,
  allowedFrom: CheckinoutStatus[],
  nextStatus: CheckinoutStatus,
  getRejectCode?: (pet: FakePet) => string | null
) =>
  vi.fn(async ({ petId }: { petId: string }) => {
    if (heldActions) await heldActions;

    const injectedCode = injectedFailures.get(name);
    if (injectedCode) {
      injectedFailures.delete(name);
      return rejectWith(500, injectedCode);
    }

    const pet = getPets(getTodayKey()).find((item) => String(item.petId) === petId);

    if (!pet) return rejectWith(409, 'ATTENDANCE_CHECKINOUT-409-4');
    const rejectCode = getRejectCode?.(pet);
    if (rejectCode) return rejectWith(409, rejectCode);
    if (!allowedFrom.includes(pet.status)) return rejectWith(409, 'ATTENDANCE_CHECKINOUT-409-1');

    const nowIso = new Date().toISOString();
    pet.status = nextStatus;
    if (nextStatus === 'CHECKED_IN') pet.checkInAt = pet.checkInAt ?? nowIso;
    if (nextStatus === 'NOT_CHECKED_IN' || nextStatus === 'ABSENT') pet.checkInAt = null;
    pet.checkOutAt = nextStatus === 'CHECKED_OUT' ? nowIso : null;

    return createResponse(null);
  });

const fakeAttendanceApi = {
  getAttendanceCheckinoutSummary: vi.fn(getSummary),
  getAttendanceCheckinoutCandidates: vi.fn(getCandidates),
  getAttendanceCheckinoutToday: vi.fn(getToday),
  postAttendanceCheckIn: createAction('postAttendanceCheckIn', ['NOT_CHECKED_IN'], 'CHECKED_IN'),
  postAttendanceAbsent: createAction('postAttendanceAbsent', ['NOT_CHECKED_IN'], 'ABSENT'),
  postAttendanceCheckOut: createAction('postAttendanceCheckOut', ['CHECKED_IN'], 'CHECKED_OUT'),
  postAttendanceCancelCheckIn: createAction('postAttendanceCancelCheckIn', ['CHECKED_IN'], 'NOT_CHECKED_IN', (pet) => {
    if (pet.status === 'CHECKED_OUT') return 'ATTENDANCE_CHECKINOUT-409-2';
    if (pet.attendanceRecordSent) return 'ATTENDANCE_CHECKINOUT-409-3';
    return null;
  }),
  postAttendanceCancelAbsent: createAction('postAttendanceCancelAbsent', ['ABSENT'], 'NOT_CHECKED_IN'),
  postAttendanceCancelCheckOut: createAction('postAttendanceCancelCheckOut', ['CHECKED_OUT'], 'CHECKED_IN'),
};

const fakeOwnerMembersApi = {
  getOwnerMembers: vi.fn(() => {
    const failure = takeInjectedReadFailure('members');
    if (failure) return failure;

    return Promise.resolve(createResponse({ members: [], totalStudentCount: settings.totalMemberCount }));
  }),
};

const fakeAttendanceServer = {
  /** 날짜별 데이터와 설정을 비우고 호출 기록을 지운다. */
  reset: () => {
    nextPetId = 1;
    settings = { ...DEFAULT_SETTINGS };
    petsByDate = new Map();
    injectedFailures = new Map();
    injectedReadFailures = new Set();
    heldActions = null;
    Object.values(fakeAttendanceApi).forEach((fn) => fn.mockClear());
    fakeOwnerMembersApi.getOwnerMembers.mockClear();
  },
  /** 그 날짜(`YYYY-MM-DD`)에 예약한 원생들을 넣는다. */
  seedDay: (dateKey: string, pets: FakePet[]) => {
    petsByDate.set(dateKey, pets);
  },
  /** 하루 정원·등원 가능 시간 설정 여부를 바꾼다. */
  setSettings: (next: Partial<FakeServerSettings>) => {
    settings = { ...settings, ...next };
  },
  /** 그 처리 API가 다음에 한 번 받는 요청을 `code` 오류(ApiError)로 실패시킨다. */
  failNextAction: (name: ActionName, code = 'UNKNOWN_ERROR') => {
    injectedFailures.set(name, code);
  },
  /** 그 조회가 다음에 한 번 받는 요청을 오류(ApiError)로 실패시킨다. */
  failNextRead: (name: ReadName) => {
    injectedReadFailures.add(name);
  },
  /** 처리 요청을 `release()`를 부를 때까지 붙잡아 둔다. (요청 중 상태 확인용) */
  holdActions: () => {
    let release: () => void = () => {};
    heldActions = new Promise<void>((resolve) => {
      release = () => {
        heldActions = null;
        resolve();
      };
    });
    return release;
  },
  /** 그 날짜의 원생 상태를 그대로 돌려준다. */
  getPets,
};

export { createFakePet, fakeAttendanceApi, fakeAttendanceServer, fakeOwnerMembersApi };
export type { FakePet };
