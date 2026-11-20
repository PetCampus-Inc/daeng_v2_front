type OwnerDailyTab = 'attendance-check' | 'attendance-list';

const OWNER_DAILY_TAB_LABEL: Record<OwnerDailyTab, string> = {
  'attendance-check': '등원처리',
  'attendance-list': '등원목록',
};

type OwnerDailyCancelKind = 'checkIn' | 'absent' | 'checkOut';

/** 취소 확인창의 `{target}의 …을 취소할까요?` 제목 대상과 본문. */
const OWNER_DAILY_CANCEL_CONTENT: Record<OwnerDailyCancelKind, { target: string; description: string }> = {
  checkIn: { target: '등원', description: '취소하면 등원 전 상태로 돌아가요.' },
  absent: { target: '결석', description: '취소하면 등원 전 상태로 돌아가요.' },
  checkOut: { target: '하원', description: '취소하면 재원 중 상태로 돌아가요.' },
};

export { OWNER_DAILY_CANCEL_CONTENT, OWNER_DAILY_TAB_LABEL };
export type { OwnerDailyCancelKind, OwnerDailyTab };
