'use client';

import type { ReactNode } from 'react';

import { useOpenExternalLink } from '@shared/lib/bridge';

/** 본문 안의 링크. 앱에서는 브릿지로, 웹에서는 새 탭으로 연다. */
function RichContentLink({ url, children }: { url: string; children: ReactNode }) {
  const openExternalLink = useOpenExternalLink();

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='text-text-accent underline'
      onClick={(event) => {
        event.preventDefault();
        openExternalLink(url);
      }}
    >
      {children}
    </a>
  );
}

export { RichContentLink };
