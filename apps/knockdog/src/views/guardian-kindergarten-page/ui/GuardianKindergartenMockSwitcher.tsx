'use client';

import { SHOW_CONNECTION_MOCK_SWITCHER } from '@views/guardian-kindergarten-page/config/guardianKindergartenMock';
import { useGuardianKindergartenMockStore } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenMockStore';
import type { GuardianKindergartenConnectionStatus } from '@views/guardian-kindergarten-page/model/guardianKindergartenConnection';

const STATUS_OPTIONS: { value: GuardianKindergartenConnectionStatus | null; label: string }[] = [
  { value: null, label: 'default(none)' },
  { value: 'none', label: 'none' },
  { value: 'pending', label: 'pending' },
];

/** API 연동 전 연결 상태 강제 전환용 */
function GuardianKindergartenMockSwitcher() {
  const statusOverride = useGuardianKindergartenMockStore((state) => state.statusOverride);
  const setStatusOverride = useGuardianKindergartenMockStore((state) => state.setStatusOverride);

  if (process.env.NODE_ENV !== 'development' || !SHOW_CONNECTION_MOCK_SWITCHER) return null;

  return (
    <div className='fixed bottom-[calc(var(--bottom-bar-height)+12px)] left-3 z-50 flex flex-col gap-1 rounded-lg bg-black/70 p-2 text-[11px] text-white'>
      <span className='font-semibold opacity-80'>connection mock</span>
      <div className='flex gap-1'>
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
  );
}

export { GuardianKindergartenMockSwitcher };
