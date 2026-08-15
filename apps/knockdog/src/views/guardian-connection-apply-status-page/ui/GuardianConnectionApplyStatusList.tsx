'use client';

import type { GuardianConnectionApplyItem } from '@views/guardian-connection-apply-status-page/config/guardianConnectionApplyStatus';
import { GuardianConnectionApplyStatusCard } from '@views/guardian-connection-apply-status-page/ui/GuardianConnectionApplyStatusCard';

interface GuardianConnectionApplyStatusListProps {
  items: GuardianConnectionApplyItem[];
  onCancel?: (id: string) => void;
}

function GuardianConnectionApplyStatusList({ items, onCancel }: GuardianConnectionApplyStatusListProps) {
  return (
    <ul className='flex w-full flex-col gap-4 px-4 py-5'>
      {items.map((item) => (
        <li key={item.id}>
          <GuardianConnectionApplyStatusCard item={item} onCancel={onCancel} />
        </li>
      ))}
    </ul>
  );
}

export { GuardianConnectionApplyStatusList };
