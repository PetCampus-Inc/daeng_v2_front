'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import { MOCK_OWNER_KINDERGARTEN_NEWS } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsMock';
import type { OwnerKindergartenNewsItem } from '@views/owner-kindergarten-news-page/model/ownerKindergartenNews';

/**
 * 소식 목록
 * 소식 없음: `/owner/news?empty=1`
 */
function useOwnerKindergartenNews() {
  const searchParams = useSearchParams();
  const forceEmpty = searchParams.get('empty') === '1';

  const items = useMemo<OwnerKindergartenNewsItem[]>(
    () => (forceEmpty ? [] : MOCK_OWNER_KINDERGARTEN_NEWS),
    [forceEmpty]
  );

  return {
    items,
    hasNews: items.length > 0,
  };
}

export { useOwnerKindergartenNews };
