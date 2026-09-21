'use client';

import type { OwnerKindergartenNewsListItemView } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';
import { OwnerKindergartenNewsListItem } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsListItem';
import { useInfiniteScroll } from '@shared/lib/react/useInfiniteScroll';
import { InfiniteScrollFooter } from '@shared/ui/loading-spinner';

interface OwnerKindergartenNewsListProps {
  items: OwnerKindergartenNewsListItemView[];
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

function OwnerKindergartenNewsList({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: OwnerKindergartenNewsListProps) {
  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className='flex w-full flex-col pb-[68px]'>
      {items.map((item) => (
        <OwnerKindergartenNewsListItem key={item.id} item={item} />
      ))}
      <InfiniteScrollFooter
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={lastElementCallback}
      />
    </div>
  );
}

export { OwnerKindergartenNewsList };
