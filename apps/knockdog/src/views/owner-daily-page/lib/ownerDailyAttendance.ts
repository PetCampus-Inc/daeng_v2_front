type AttendanceStatus = 'NOT_CHECKED_IN' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT';

/** 등원 예정 시간으로부터 이 시간(분)이 지나도 등원하지 않으면 지각이다. */
const LATE_AFTER_MINUTES = 30;

type CheckInChip = 'late' | 'checkedIn' | 'absent';
type TodayListTag = 'checkedIn' | 'recordSent' | 'checkedOut' | 'dayCompleted' | 'disconnected';
type PastDayTag = TodayListTag | 'absent';
type CardButtonVariant = 'orangeFilled' | 'grayFilled' | 'grayOutline';
type TodayListButtonKind = 'writeRecord' | 'viewRecord' | 'checkOut' | 'cancelCheckOut';

interface TodayListCardButton {
  kind: TodayListButtonKind;
  variant: CardButtonVariant;
}

interface TodayListCardView {
  tag: TodayListTag;
  buttons: TodayListCardButton[];
}

interface AttendanceSearchTarget {
  name: string;
  breed: string;
  status: AttendanceStatus;
  reservedTime: string;
}

/**
 * 등원 전 원생이 지각인지 판정한다. 현재 시각 ≥ 등원 예정 시간 + 30분이면 지각이다.
 * 등원 완료·하원 완료·결석 원생은 지각이 아니다.
 * @param params.dateKey 조회 날짜 (KST, `YYYY-MM-DD`)
 * @param params.reservedTime 등원 예정 시간 (KST, `HH:mm`)
 */
function isLateForCheckIn({
  status,
  dateKey,
  reservedTime,
  now,
}: {
  status: AttendanceStatus;
  dateKey: string;
  reservedTime: string;
  now: Date;
}): boolean {
  if (status !== 'NOT_CHECKED_IN') return false;

  const reservedAt = new Date(`${dateKey}T${reservedTime}:00+09:00`);
  if (Number.isNaN(reservedAt.getTime())) return false;

  return now.getTime() >= reservedAt.getTime() + LATE_AFTER_MINUTES * 60 * 1000;
}

/**
 * 등원처리 탭 목록을 검색어(이름·견종 부분 일치)와 지각 토글로 거른다. 두 조건은 함께 적용된다.
 * 검색어는 앞뒤 공백을 지우고 쓰며, 공백만 있으면 검색하지 않은 것으로 본다.
 */
function filterAttendanceList<T extends AttendanceSearchTarget>(
  items: T[],
  options: { keyword: string; lateOnly: boolean; dateKey: string; now: Date }
): T[] {
  const keyword = options.keyword.trim().toLowerCase();

  return items.filter((item) => {
    if (
      keyword &&
      !item.name.toLowerCase().includes(keyword) &&
      !item.breed.toLowerCase().includes(keyword)
    ) {
      return false;
    }

    if (!options.lateOnly) return true;

    return isLateForCheckIn({
      status: item.status,
      dateKey: options.dateKey,
      reservedTime: item.reservedTime,
      now: options.now,
    });
  });
}

/** 등원처리 탭 카드의 상태 칩. 등원 전이면서 지각이 아니면 칩이 없다. */
function getCheckInChip({
  status,
  isLate,
}: {
  status: AttendanceStatus;
  isLate: boolean;
}): CheckInChip | null {
  if (status === 'ABSENT') return 'absent';
  if (status === 'CHECKED_IN' || status === 'CHECKED_OUT') return 'checkedIn';

  return isLate ? 'late' : null;
}

/** 오늘 등원목록 카드의 상태 태그와 하단 버튼. 연결해제가 출결 상태보다 우선한다. */
function getTodayListCardView({
  status,
  recordSent,
  disconnected,
}: {
  status: AttendanceStatus;
  recordSent: boolean;
  disconnected: boolean;
}): TodayListCardView {
  if (disconnected) return { tag: 'disconnected', buttons: [] };

  const isCheckedOut = status === 'CHECKED_OUT';
  const recordButton: TodayListCardButton = recordSent
    ? { kind: 'viewRecord', variant: 'grayOutline' }
    : { kind: 'writeRecord', variant: isCheckedOut ? 'orangeFilled' : 'grayFilled' };

  if (isCheckedOut) {
    return {
      tag: recordSent ? 'dayCompleted' : 'checkedOut',
      buttons: [recordButton, { kind: 'cancelCheckOut', variant: 'grayOutline' }],
    };
  }

  return {
    tag: recordSent ? 'recordSent' : 'checkedIn',
    buttons: [recordButton, { kind: 'checkOut', variant: 'orangeFilled' }],
  };
}

/** 지난 날짜 카드의 최종 상태 태그 하나. 등원 기록만 있으면 태그가 없다. */
function getPastDayTag({
  status,
  recordSent,
  disconnected,
}: {
  status: AttendanceStatus;
  recordSent: boolean;
  disconnected: boolean;
}): PastDayTag | null {
  if (disconnected) return 'disconnected';
  if (status === 'ABSENT') return 'absent';
  if (status === 'CHECKED_OUT') return recordSent ? 'dayCompleted' : 'checkedOut';
  if (recordSent) return 'recordSent';

  return null;
}

export {
  filterAttendanceList,
  getCheckInChip,
  getPastDayTag,
  getTodayListCardView,
  isLateForCheckIn,
  LATE_AFTER_MINUTES,
};
export type {
  AttendanceStatus,
  CardButtonVariant,
  CheckInChip,
  PastDayTag,
  TodayListButtonKind,
  TodayListCardButton,
  TodayListCardView,
  TodayListTag,
};
