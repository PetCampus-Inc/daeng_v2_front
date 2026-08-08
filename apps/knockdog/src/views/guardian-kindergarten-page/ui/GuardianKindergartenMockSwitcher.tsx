'use client';

import type { GuardianAttendanceDayMock } from '@views/guardian-kindergarten-page/config/guardianAttendanceMock';
import { SHOW_CONNECTION_MOCK_SWITCHER } from '@views/guardian-kindergarten-page/config/guardianKindergartenMock';
import { useGuardianKindergartenMockStore } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

const STATUS_OPTIONS: { value: GuardianKindergartenConnectionStatus | null; label: string }[] = [
  { value: null, label: 'default' },
  { value: 'none', label: 'none' },
  { value: 'pending', label: 'pending' },
  { value: 'approved', label: 'approved' },
];

function createTodayCheckInAt(hours = 9, minutes = 0) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const ATTENDANCE_PRESETS: { label: string; value: GuardianAttendanceDayMock | null }[] = [
  { label: 'default', value: null },
  {
    label: 'album0',
    value: { checkInAt: null, hasUnreadAlarm: false, hasDailyNotice: false, albumPhotoCount: 0 },
  },
  {
    label: 'album1',
    value: {
      checkInAt: createTodayCheckInAt(9, 0),
      hasUnreadAlarm: true,
      hasDailyNotice: false,
      albumPhotoCount: 1,
    },
  },
  {
    label: 'album2',
    value: {
      checkInAt: createTodayCheckInAt(9, 0),
      hasUnreadAlarm: false,
      hasDailyNotice: false,
      albumPhotoCount: 2,
    },
  },
  {
    label: 'album3',
    value: {
      checkInAt: createTodayCheckInAt(9, 0),
      hasUnreadAlarm: true,
      hasDailyNotice: false,
      albumPhotoCount: 3,
    },
  },
];

/** API 연동 전 연결/등원 mock 강제 전환용 */
function GuardianKindergartenMockSwitcher() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const setStatusOverride = useGuardianKindergartenMockStore((state) => state.setStatusOverride);
  const attendanceOverride = useGuardianKindergartenMockStore((state) => state.attendanceOverride);
  const setAttendanceOverride = useGuardianKindergartenMockStore((state) => state.setAttendanceOverride);

  if (process.env.NODE_ENV !== 'development' || !SHOW_CONNECTION_MOCK_SWITCHER) return null;

  return (
    <div className='fixed bottom-[calc(var(--bottom-bar-height)+12px)] left-3 z-50 flex max-w-[220px] flex-col gap-2 rounded-lg bg-black/70 p-2 text-[11px] text-white'>
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
            const isActive =
              attendanceOverride === preset.value ||
              (preset.value === null && attendanceOverride === null) ||
              (preset.value != null &&
                attendanceOverride != null &&
                attendanceOverride.checkInAt === preset.value.checkInAt &&
                attendanceOverride.albumPhotoCount === preset.value.albumPhotoCount &&
                attendanceOverride.hasUnreadAlarm === preset.value.hasUnreadAlarm);
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
