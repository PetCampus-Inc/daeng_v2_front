'use client';

import {
  createTodayAt,
  MOCK_DAILY_NOTICE,
  MOCK_RECORD_DATE_KEYS,
  type GuardianAttendanceDayMock,
} from '@views/guardian-kindergarten-page/config/guardianAttendanceMock';
import { SHOW_CONNECTION_MOCK_SWITCHER } from '@views/guardian-kindergarten-page/config/guardianKindergartenMock';
import { useGuardianKindergartenMockStore } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

const STATUS_OPTIONS: { value: GuardianKindergartenConnectionStatus | null; label: string }[] = [
  { value: null, label: 'default' },
  { value: 'none', label: 'none' },
  { value: 'pending', label: 'pending' },
  { value: 'approved', label: 'approved' },
  { value: 'disconnected', label: 'disconnected' },
];

const ATTENDANCE_PRESETS: { label: string; value: GuardianAttendanceDayMock | null }[] = [
  { label: 'default', value: null },
  {
    label: 'pre',
    value: {
      checkInAt: null,
      checkOutAt: null,
      hasUnreadAlarm: false,
      hasDailyNotice: false,
      dailyNotice: null,
      albumPhotoCount: 0,
      recordDateKeys: MOCK_RECORD_DATE_KEYS.filter((_, index) => index > 0),
    },
  },
  {
    label: 'in',
    value: {
      checkInAt: createTodayAt(9, 0),
      checkOutAt: null,
      hasUnreadAlarm: true,
      hasDailyNotice: false,
      dailyNotice: null,
      albumPhotoCount: 1,
      recordDateKeys: MOCK_RECORD_DATE_KEYS,
    },
  },
  {
    label: 'inEmpty',
    value: {
      checkInAt: createTodayAt(9, 0),
      checkOutAt: null,
      hasUnreadAlarm: true,
      hasDailyNotice: false,
      dailyNotice: null,
      albumPhotoCount: 0,
      recordDateKeys: MOCK_RECORD_DATE_KEYS,
    },
  },
  {
    label: 'inNote',
    value: {
      checkInAt: createTodayAt(9, 0),
      checkOutAt: null,
      hasUnreadAlarm: true,
      hasDailyNotice: true,
      dailyNotice: MOCK_DAILY_NOTICE,
      albumPhotoCount: 3,
      recordDateKeys: MOCK_RECORD_DATE_KEYS,
    },
  },
  {
    label: 'out',
    value: {
      checkInAt: createTodayAt(9, 0),
      checkOutAt: createTodayAt(17, 5),
      hasUnreadAlarm: true,
      hasDailyNotice: false,
      dailyNotice: null,
      albumPhotoCount: 1,
      recordDateKeys: MOCK_RECORD_DATE_KEYS,
    },
  },
  {
    label: 'outNote',
    value: {
      checkInAt: createTodayAt(9, 0),
      checkOutAt: createTodayAt(17, 5),
      hasUnreadAlarm: true,
      hasDailyNotice: true,
      dailyNotice: MOCK_DAILY_NOTICE,
      albumPhotoCount: 3,
      recordDateKeys: MOCK_RECORD_DATE_KEYS,
    },
  },
];

function isSameAttendancePreset(
  current: GuardianAttendanceDayMock | null,
  preset: GuardianAttendanceDayMock | null
) {
  if (current === preset) return true;
  if (current == null || preset == null) return current === preset;
  return (
    current.hasDailyNotice === preset.hasDailyNotice &&
    current.albumPhotoCount === preset.albumPhotoCount &&
    Boolean(current.checkInAt) === Boolean(preset.checkInAt) &&
    Boolean(current.checkOutAt) === Boolean(preset.checkOutAt) &&
    current.hasUnreadAlarm === preset.hasUnreadAlarm
  );
}

/** API 연동 전 연결/등원 mock 강제 전환용 */
function GuardianKindergartenMockSwitcher() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const setStatusOverride = useGuardianKindergartenMockStore((state) => state.setStatusOverride);
  const attendanceOverride = useGuardianKindergartenMockStore((state) => state.attendanceOverride);
  const setAttendanceOverride = useGuardianKindergartenMockStore((state) => state.setAttendanceOverride);

  if (process.env.NODE_ENV !== 'development' || !SHOW_CONNECTION_MOCK_SWITCHER) return null;

  return (
    <div className='fixed bottom-[calc(var(--bottom-bar-height)+12px)] left-3 z-50 flex max-w-[240px] flex-col gap-2 rounded-lg bg-black/70 p-2 text-[11px] text-white'>
      <div className='flex flex-col gap-1'>
        <span className='font-semibold opacity-80'>connection</span>
        <div className='flex flex-wrap gap-1'>
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusOverride === option.value;
            return (
              <button
                key={option.label}
                type='button'
                className={`rounded px-2 py-1 ${isActive ? 'bg-fill-primary-500' : 'bg-white/20'}`}
                onClick={() => setStatusOverride(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className='flex flex-col gap-1'>
        <span className='font-semibold opacity-80'>attendance</span>
        <div className='flex flex-wrap gap-1'>
          {ATTENDANCE_PRESETS.map((preset) => {
            const isActive = isSameAttendancePreset(attendanceOverride, preset.value);
            return (
              <button
                key={preset.label}
                type='button'
                className={`rounded px-2 py-1 ${isActive ? 'bg-fill-primary-500' : 'bg-white/20'}`}
                onClick={() => setAttendanceOverride(preset.value)}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export { GuardianKindergartenMockSwitcher };
