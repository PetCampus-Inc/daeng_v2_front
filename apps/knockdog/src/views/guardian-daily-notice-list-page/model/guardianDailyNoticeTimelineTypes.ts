import type { GuardianCalendarDailyNotice } from '@entities/guardian-home';

interface GuardianDailyNoticeMonthItem {
  /** YYYY-MM-DD */
  dateKey: string;
  date: Date;
  checkInAt: Date | null;
  checkOutAt: Date | null;
  dailyNotice: GuardianCalendarDailyNotice | null;
  thumbnailUrl: string | null;
}

type GuardianDailyNoticeTimelineRow =
  | {
      type: 'notice';
      id: string;
      dateKey: string;
      date: Date;
      item: GuardianDailyNoticeMonthItem;
    }
  | {
      type: 'disconnected';
      id: string;
      dateKey: string;
      date: Date;
    }
  | {
      type: 'connected';
      id: string;
      dateKey: string;
      date: Date;
    };

export type { GuardianDailyNoticeMonthItem, GuardianDailyNoticeTimelineRow };
