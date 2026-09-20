'use client';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { useOwnerMemberConnectionHistory } from '@views/owner/member-profile/model/useOwnerMemberConnectionHistory';
import { OwnerMemberConnectionHistoryCard } from '@views/owner/member-profile/ui/OwnerMemberConnectionHistoryCard';

function OwnerMemberConnectionHistorySection() {
  const { items } = useOwnerMemberConnectionHistory();

  if (items.length === 0) return null;

  return (
    <div className='flex flex-col gap-4 px-4 pb-5'>
      <h2 className='h3-extrabold text-text-primary'>
        {ownerMemberProfileContent.connectionHistoryTitle}
      </h2>
      <div className='flex flex-col gap-2'>
        {items.map((item) => (
          <OwnerMemberConnectionHistoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export { OwnerMemberConnectionHistorySection };
