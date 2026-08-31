'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { persistInviteEntrySource } from './entrySource';

function InviteEntrySourceSync() {
  const searchParams = useSearchParams();

  useEffect(() => {
    persistInviteEntrySource(searchParams);
  }, [searchParams]);

  return null;
}

export { InviteEntrySourceSync };
