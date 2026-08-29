'use client';

import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';

interface GuardianAlbumScrollTopButtonProps {
  visible: boolean;
  onClick: () => void;
}

function GuardianAlbumScrollTopButton({ visible, onClick }: GuardianAlbumScrollTopButtonProps) {
  if (!visible) return null;

  return (
    <button
      type='button'
      className='border-line-200 bg-bg-0 absolute right-4 bottom-[calc(1.25rem+max(var(--safe-area-inset-bottom,0px),env(safe-area-inset-bottom,0px)))] z-10 size-[52px] rounded-full border shadow-[0px_2px_6px_rgba(0,0,0,0.12)]'
      aria-label={guardianAlbumContent.scrollTopAriaLabel}
      onClick={onClick}
    >
      <Icon icon='ChevronTop' className='text-fill-secondary-700 mx-auto size-6' />
    </button>
  );
}

export { GuardianAlbumScrollTopButton };
