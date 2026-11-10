type OwnerDailyTab = 'attendance-check' | 'attendance-list';

const OWNER_DAILY_TAB_LABEL: Record<OwnerDailyTab, string> = {
  'attendance-check': '등원처리',
  'attendance-list': '등원목록',
};

export { OWNER_DAILY_TAB_LABEL };
export type { OwnerDailyTab };
