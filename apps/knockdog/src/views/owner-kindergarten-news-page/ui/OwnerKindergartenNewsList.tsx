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
  onDelete: (newsId: string) => void | Promise<void>;
}

function OwnerKindergartenNewsList({
  items,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onDelete,
}: OwnerKindergartenNewsListProps) {
  const { lastElementCallback } = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  return (
    <div className='flex w-full flex-col pb-[68px]'>
      {items.map((item) => (
        <OwnerKindergartenNewsListItem key={item.id} item={item} onDelete={onDelete} />
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
