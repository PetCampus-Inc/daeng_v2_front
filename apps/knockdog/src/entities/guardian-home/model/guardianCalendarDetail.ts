/**
 * 보호자 유치원 탭 캘린더 상세 DTO
 * `GET /api/v0/guardian/school/calendar/detail`
 */

import { parseApiDateTime, type GuardianHomeDateTime } from './guardianHome';

type GuardianCalendarCheckinoutStatus =
  | 'NOT_CHECKED_IN'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | string;

type GuardianCalendarNoteStatus = 'DRAFT' | 'SENT' | string;

interface GuardianCalendarCheckInOutDto {
  petId?: number | string | null;
  checkinoutStatus?: GuardianCalendarCheckinoutStatus | null;
  checkInAt?: GuardianHomeDateTime | null;
  checkOutAt?: GuardianHomeDateTime | null;
}

interface GuardianCalendarNoteDto {
  id?: number | string | null;
  petId?: number | string | null;
  date?: string | null;
  status?: GuardianCalendarNoteStatus | null;
  condition?: string | null;
  snack?: string | null;
  poop?: string | null;
  poopMemo?: string | null;
  note?: string | null;
  sentAt?: GuardianHomeDateTime | null;
  updatedAt?: GuardianHomeDateTime | null;
  checkInAt?: GuardianHomeDateTime | null;
  checkOutAt?: GuardianHomeDateTime | null;
}

interface GuardianCalendarDetailDto {
  date?: string | null;
  checkInOut?: GuardianCalendarCheckInOutDto | null;
  note?: GuardianCalendarNoteDto | null;
}

interface GuardianCalendarDailyNotice {
  writtenAt: string;
  updatedAt: string | null;
  conditionLabel: string;
  stoolLabel: string;
  poop: string | null;
  snack: string;
  poopMemo: string;
  body: string;
}

interface GuardianCalendarDetail {
  date: string | null;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  checkinoutStatus: string | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
}

const CONDITION_LABELS: Record<string, string> = {
  ENERGETIC: '활력 넘치게 지냈어요',
  USUAL: '평소와 비슷했어요',
  RESTED: '차분히 휴식했어요',
  WATCH_AFTER_RETURN: '귀가 후 확인이 필요해요',
};

const POOP_LABELS: Record<string, string> = {
  HEALTHY: '건강함',
  HARD: '딱딱함',
  LOOSE: '묽음',
  NEEDS_ATTENTION: '주의 필요',
  NONE: '배변 없음',
};

function toDailyNotice(
  dto: GuardianCalendarNoteDto | null | undefined
): GuardianCalendarDailyNotice | null {
  if (!dto) return null;

  const status = typeof dto.status === 'string' ? dto.status.toUpperCase() : '';
  // 보호자에게는 발송(SENT)된 알림장만 노출
  if (status !== 'SENT') return null;

  const writtenAtDate = parseApiDateTime(dto.sentAt) ?? parseApiDateTime(dto.updatedAt);
  if (!writtenAtDate) return null;

  const conditionKey = typeof dto.condition === 'string' ? dto.condition.toUpperCase() : '';
  const poopKey = typeof dto.poop === 'string' ? dto.poop.toUpperCase() : '';
  const updatedAtDate = parseApiDateTime(dto.updatedAt);
  const conditionLabel = CONDITION_LABELS[conditionKey] ?? '';
  const stoolLabel = POOP_LABELS[poopKey] ?? '';

  return {
    writtenAt: writtenAtDate.toISOString(),
    updatedAt: updatedAtDate ? updatedAtDate.toISOString() : null,
    // 미선택 컨디션/배변은 라벨을 비워 보호자 UI에서 숨김
    conditionLabel,
    stoolLabel,
    poop: stoolLabel ? poopKey : null,
    snack: dto.snack?.trim() ?? '',
    poopMemo: dto.poopMemo?.trim() ?? '',
    body: dto.note?.trim() ?? '',
  };
}

function toGuardianCalendarDetail(
  dto: GuardianCalendarDetailDto | null | undefined
): GuardianCalendarDetail {
  const checkInOut = dto?.checkInOut;

  return {
    date: dto?.date ?? null,
    checkInAt: parseApiDateTime(checkInOut?.checkInAt),
    checkOutAt: parseApiDateTime(checkInOut?.checkOutAt),
    checkinoutStatus: checkInOut?.checkinoutStatus ?? null,
    dailyNotice: toDailyNotice(dto?.note),
  };
}

export { toGuardianCalendarDetail };
export type {
  GuardianCalendarCheckInOutDto,
  GuardianCalendarDailyNotice,
  GuardianCalendarDetail,
  GuardianCalendarDetailDto,
  GuardianCalendarNoteDto,
};
