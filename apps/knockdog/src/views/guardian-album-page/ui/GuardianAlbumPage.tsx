'use client';

import { useState } from 'react';
import { Icon } from '@knockdog/ui';
import { overlay } from 'overlay-kit';

import { guardianAlbumContent } from '@views/guardian-album-page/config/guardianAlbumContent';
import { MOCK_ALBUM_KINDERGARTENS } from '@views/guardian-album-page/config/guardianAlbumKindergartenMock';
import { GuardianAlbumEmptyState } from '@views/guardian-album-page/ui/GuardianAlbumEmptyState';
import { GuardianAlbumKindergartenSelectSheet } from '@views/guardian-album-page/ui/GuardianAlbumKindergartenSelectSheet';
import { Header } from '@widgets/Header';

function GuardianAlbumPage() {
  const content = guardianAlbumContent;
  const kindergartens = MOCK_ALBUM_KINDERGARTENS;
  const canSelectKindergarten = kindergartens.length > 1;
  const defaultKindergartenId =
    kindergartens.find((item) => item.attendedUntil == null)?.id ?? kindergartens[0]?.id ?? null;

  const [selectedKindergartenId, setSelectedKindergartenId] = useState<string | null>(
    defaultKindergartenId
  );

  const selectedKindergarten =
    kindergartens.find((item) => item.id === selectedKindergartenId) ?? kindergartens[0] ?? null;
  const kindergartenName = selectedKindergarten?.name ?? '유치원';

  const handleKindergartenSelectClick = () => {
    if (!canSelectKindergarten) return;

    overlay.open(({ isOpen, close }) => (
      <GuardianAlbumKindergartenSelectSheet
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={selectedKindergartenId}
        onSelect={setSelectedKindergartenId}
      />
    ));
  };

  return (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.BackButton />
        {canSelectKindergarten ? (
          <Header.CenterSection>
            <button
              type='button'
              className='h3-extrabold text-text-primary gap-x1 flex max-w-[200px] items-center'
              aria-label={content.kindergartenSelectAriaLabel}
              onClick={handleKindergartenSelectClick}
            >
              <span className='truncate'>{kindergartenName}</span>
              <Icon icon='ChevronBottom' className='text-text-primary size-5 shrink-0' aria-hidden='true' />
            </button>
          </Header.CenterSection>
        ) : (
          <Header.Title className='max-w-[200px] truncate'>{kindergartenName}</Header.Title>
        )}
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
