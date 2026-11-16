import type { AttendanceStatus } from '@views/owner-daily-page/lib/ownerDailyAttendance';
import type { OwnerDailyFocusStatus } from '@views/owner-daily-page/lib/ownerDailyUrlState';

/** 홈에서 누른 상태에 해당하는 출결 상태. `등원 완료`는 이미 하원한 원생도 등원한 원생이라 함께 센다. */
const FOCUS_ATTENDANCE_STATUSES: Record<OwnerDailyFocusStatus, readonly AttendanceStatus[]> = {
  checkedIn: ['CHECKED_IN', 'CHECKED_OUT'],
  absent: ['ABSENT'],
  checkedOut: ['CHECKED_OUT'],
};

/** 스크롤한 뒤 카드 위에 남길 여유 간격(px). */
const SCROLL_TOP_GAP_PX = 12;

/**
 * 스크롤 영역 안에서 홈에서 누른 상태의 첫 원생 카드가 상단 고정 탭 바로 아래에 오도록 스크롤한다.
 * 원생 카드(`li`)의 `data-attendance-status` 속성으로 카드를 찾는다. 해당 상태의 카드가 화면에 없으면 아무것도 하지 않는다.
 * @returns 스크롤할 카드를 찾았는지 여부
 */
const scrollToFirstFocusCard = (container: HTMLElement, focusStatus: OwnerDailyFocusStatus): boolean => {
  const selector = FOCUS_ATTENDANCE_STATUSES[focusStatus]
    .map((status) => `[data-attendance-status="${status}"]`)
    .join(', ');
  const card = container.querySelector<HTMLElement>(selector);
  if (!card) return false;

  const stickyTabsHeight = container.querySelector<HTMLElement>('[role="tablist"]')?.offsetHeight ?? 0;
  const cardTop = card.getBoundingClientRect().top - container.getBoundingClientRect().top;

  container.scrollTo({ top: container.scrollTop + cardTop - stickyTabsHeight - SCROLL_TOP_GAP_PX });
  return true;
};

export { scrollToFirstFocusCard };
