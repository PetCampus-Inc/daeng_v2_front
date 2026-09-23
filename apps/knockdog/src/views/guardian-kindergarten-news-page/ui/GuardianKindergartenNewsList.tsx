'use client';

import type { GuardianKindergartenNewsListItemView } from '@views/guardian-kindergarten-news-page/model/guardianKindergartenNews';
import { GuardianKindergartenNewsListItem } from '@views/guardian-kindergarten-news-page/ui/GuardianKindergartenNewsListItem';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';

interface GuardianKindergartenNewsListProps {
  items: GuardianKindergartenNewsListItemView[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  schoolId?: string;
}

function GuardianKindergartenNewsList({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  schoolId,
}: GuardianKindergartenNewsListProps) {
  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className='bg-bg-50 flex w-full flex-col gap-2 pb-[68px]'>
      {items.map((item) => (
        <GuardianKindergartenNewsListItem key={item.id} item={item} schoolId={schoolId} />
      ))}
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={lastElementCallback}
      />
    </div>
  );
}

export { GuardianKindergartenNewsList };
