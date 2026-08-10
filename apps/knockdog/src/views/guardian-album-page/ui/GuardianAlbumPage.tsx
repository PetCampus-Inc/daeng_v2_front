'use client';

import { Icon } from '@knockdog/ui';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { useGuardianKindergartenConnection } from '@views/guardian-kindergarten-page/model/useGuardianKindergartenConnection';
import { Header } from '@widgets/Header';

function GuardianAlbumPage() {
  const content = guardianAlbumContent;
  const { linkedKindergarten } = useGuardianKindergartenConnection();
  const kindergartenName = linkedKindergarten?.name ?? '유치원';

  return (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title className='gap-x1 flex max-w-[200px] items-center'>
          <span className='truncate'>{kindergartenName}</span>
          <Icon icon='ChevronBottom' className='text-text-primary size-5 shrink-0' aria-hidden='true' />
        </Header.Title>
        <Header.RightSection>
          <button
            type='button'
            className='inline-flex size-6 items-center justify-center'
            aria-label={content.filterAriaLabel}
          >
            <Icon icon='Filter' className='text-fill-secondary-700 size-6' />
          </button>
          <button
            type='button'
            className='inline-flex size-6 items-center justify-center'
            aria-label={content.infoAriaLabel}
          >
            <Icon icon='InfoLine' className='text-fill-secondary-700 size-6' />
          </button>
        </Header.RightSection>
      </Header>

      <GuardianAlbumEmptyState />
    </div>
  );
}

export { GuardianAlbumPage };
