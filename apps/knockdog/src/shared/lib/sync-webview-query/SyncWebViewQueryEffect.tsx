'use client';

import { useEffect } from 'react';

export function SyncWebViewQueryEffect() {
  useEffect(() => {
    import('./syncWebViewQuery');
  }, []);

  return null;
}
