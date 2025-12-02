import { useEffect, useRef } from 'react';

import type { Kindergarten } from '@entities/kindergarten';
import { useSearchHistory } from '@shared/store/useSearchHistory';

type RecentKindergartenView = Pick<Kindergarten, 'id' | 'title' | 'roadAddress'>;

export function useRecentKindergartenView(kindergarten?: RecentKindergartenView) {
  const { addRecentView } = useSearchHistory();
  const lastSavedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!kindergarten) return;

    const { id, title, roadAddress } = kindergarten;
    if (!id || !title) return;
    if (lastSavedIdRef.current === id) return;

    addRecentView({
      id,
      label: title,
      address: roadAddress,
    });

    lastSavedIdRef.current = id;
  }, [addRecentView, kindergarten]);
}
