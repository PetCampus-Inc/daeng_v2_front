'use client';

import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';
import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { useOwnerMemberConnectionHistory } from '@views/owner/member-profile/model/useOwnerMemberConnectionHistory';
import { OwnerMemberConnectionHistoryCard } from '@views/owner/member-profile/ui/OwnerMemberConnectionHistoryCard';

interface OwnerMemberConnectionHistorySectionProps {
  petId: string;
}

function OwnerMemberConnectionHistorySection({ petId }: OwnerMemberConnectionHistorySectionProps) {
  const content = ownerMemberProfileContent;
  const { items, isPending, isError } = useOwnerMemberConnectionHistory(petId);

  if (!isPending && !isError && items.length === 0) return null;

  return (
    <div className='flex flex-col gap-4 px-4 pb-5'>
      <h2 className='h3-extrabold text-text-primary'>{content.connectionHistoryTitle}</h2>
      {isPending ? (
        <DelayedLoadingSpinner isLoading layout='content' className='py-6' />
      ) : isError ? (
        <p className='body2-regular text-text-secondary'>{content.connectionHistoryErrorText}</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {items.map((item) => (
            <OwnerMemberConnectionHistoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export { OwnerMemberConnectionHistorySection };
