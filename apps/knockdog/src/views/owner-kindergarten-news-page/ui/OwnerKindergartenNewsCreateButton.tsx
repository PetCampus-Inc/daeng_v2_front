'use client';

import { FloatingActionButton } from '@knockdog/ui';

import { ownerKindergartenNewsContent } from '@views/owner-kindergarten-news-page/config/ownerKindergartenNewsContent';

interface OwnerKindergartenNewsCreateButtonProps {
  onClick?: () => void;
}

/** 앨범 업로드 FAB와 동일 스펙 (Plus / extended=false / primarySolid) */
function OwnerKindergartenNewsCreateButton({ onClick }: OwnerKindergartenNewsCreateButtonProps) {
  return (
    <FloatingActionButton
      type='button'
      icon='Plus'
      label={ownerKindergartenNewsContent.createButtonLabel}
      extended={false}
      aria-label={ownerKindergartenNewsContent.createButtonLabel}
      className='absolute right-4 bottom-5 z-10'
      onClick={onClick}
    />
  );
}

export { OwnerKindergartenNewsCreateButton };
