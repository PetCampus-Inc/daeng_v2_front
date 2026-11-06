'use client';

import type { GuardianConnectionApplyItem } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { GuardianConnectionApplyStatusCard } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusCard';

interface GuardianConnectionApplyStatusListProps {
  items: GuardianConnectionApplyItem[];
  onCancelClick?: (item: GuardianConnectionApplyItem) => void;
}

function GuardianConnectionApplyStatusList({ items, onCancelClick }: GuardianConnectionApplyStatusListProps) {
  return (
    <ul className='flex w-full flex-col gap-4 px-4 pt-5 pb-[calc(0.5rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))]'>
      {items.map((item) => (
        <li key={item.id}>
          <GuardianConnectionApplyStatusCard item={item} onCancelClick={onCancelClick} />
        </li>
      ))}
    </ul>
  );
}

export { GuardianConnectionApplyStatusList };
