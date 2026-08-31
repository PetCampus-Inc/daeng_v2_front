'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { extractInviteTokenFromPath, persistInviteEntrySource } from './entrySource';

function InviteEntrySourceSync() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const token = extractInviteTokenFromPath(pathname ?? '');

  useEffect(() => {
    if (!token) return;
    persistInviteEntrySource(searchParams, token);
  }, [searchParams, token]);

  return null;
}

export { InviteEntrySourceSync };
