'use client';

import { overlay } from 'overlay-kit';
import { ActionButton } from '@knockdog/ui';

import { useStackNavigation } from '@shared/lib/bridge';
import { KindergartenSelectSheet } from '@shared/ui/kindergarten-select-sheet';
import { Header } from '@widgets/Header';

import { useWritableKindergartens } from '../model/useWritableKindergartens';

function GuardianMyReviewsPage() {
  const { back, push } = useStackNavigation();
  const { kindergartens, isLoading } = useWritableKindergartens();
  const canWriteReview = !isLoading && kindergartens.length > 0;

  const handleSelectKindergarten = (kindergartenId: string) => {
    push({ pathname: `/kindergarten/${kindergartenId}/write-review` });
  };

  const handleWriteReview = () => {
    overlay.open(({ isOpen, close }) => (
      <KindergartenSelectSheet
        mode='write'
        isOpen={isOpen}
        close={close}
        kindergartens={kindergartens}
        currentKindergartenId={null}
        onSelect={handleSelectKindergarten}
      />
    ));
  };

  return (
    <div className='bg-bg-0 flex h-full min-h-0 flex-1 flex-col'>
      <Header>
        <Header.BackButton onClick={() => void back()} />
        <Header.Title>내 리뷰 관리</Header.Title>
      </Header>

      <div className='flex min-h-0 flex-1 flex-col items-center justify-center px-4'>
        <div className='flex w-full flex-col items-center gap-4 px-8'>
          <div className='flex h-[140px] w-[200px] shrink-0 items-center justify-center'>
            {/* eslint-disable-next-line @next/next/no-img-element -- 빈 리뷰 일러스트 SVG */}
            <img src='/images/img_empty_my_reviews.svg' alt='' width={182} height={89} />
          </div>
          <div className='flex w-full flex-col items-center gap-1 text-center'>
            <p className='body1-bold text-text-primary w-full'>작성한 유치원 이용 후기가 없어요</p>
            <p className='body2-regular text-text-secondary w-full'>유치원 이용 후기를 작성해 보세요.</p>
          </div>
          {canWriteReview ? (
            <ActionButton type='button' onClick={handleWriteReview}>
              리뷰 작성하기
            </ActionButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { GuardianMyReviewsPage };
