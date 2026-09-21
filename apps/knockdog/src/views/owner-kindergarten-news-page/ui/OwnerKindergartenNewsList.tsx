'use client';

import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';
import { OwnerKindergartenNewsListItem } from '@views/owner-kindergarten-news-page/ui/OwnerKindergartenNewsListItem';

interface OwnerKindergartenNewsListProps {
  items: OwnerKindergartenNewsItem[];
}

function OwnerKindergartenNewsList({ items }: OwnerKindergartenNewsListProps) {
  return (
    <div className='flex w-full flex-col pb-[68px]'>
      {items.map((item) => (
        <OwnerKindergartenNewsListItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export { OwnerKindergartenNewsList };
