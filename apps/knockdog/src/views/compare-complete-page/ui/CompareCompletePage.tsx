'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@widgets/Header';
import { CompareCompleteTabs } from '@widgets/compare-complete-tabs';
import { useComparisonsQuery } from '@features/compare';
import type { KindergartenComparison } from '@entities/compare';
import { SelectedCell, serializeCategories, resolveIds, s3ToUrl } from '@entities/compare';
import { SafeArea } from '@shared/ui/safe-area';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import { useShare } from '@shared/lib/device/useShare';

function CompareCompletePage() {
  const params = useSearchParams();
  const share = useShare();

  // 🔒 안정화: params 객체 대신 문자열 키를 메모이즈해서 파싱
  const qsKey = params.toString();
  const ids = useMemo(() => resolveIds(new URLSearchParams(qsKey)), [qsKey]);

  const { data, isPending } = useComparisonsQuery(ids);

  const [left, right] = useMemo(() => data?.filter((item): item is KindergartenComparison => !!item) ?? [], [data]);

  const handleShare = () => {
    if (!left || !right) return;

    const url = `https://knockdog.com/compare-complete?ids=${left.id},${right.id}`;
    const shareData = {
      message: `${left.name}와 ${right.name}의 비교 결과를 확인해보세요!\n ${url}`,
      url,
    };

    share(shareData);
  };

  return (
    <SafeArea edges={['bottom']}>
      <div className='flex h-screen flex-col bg-white pb-16'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>비교 결과</Header.Title>
          <Header.RightSection>
            <button
              type='button'
              className='label-semibold text-text-primary absolute right-0 mr-4 px-2 py-1'
              aria-label='비교 결과 공유하기'
              onClick={handleShare}
            >
              공유하기
            </button>
          </Header.RightSection>
        </Header>

        {isPending || !left || !right ? (
          <LoadingSpinner fullscreen className='bg-text-primary' />
        ) : (
          <>
            {/* 선택된 두 유치원 */}
            <div className='grid grid-cols-2 divide-x divide-gray-200 border-y border-gray-200 bg-white'>
              {[left, right].map(({ id, name, categories, thumbnailS3Key }, idx) => {
                return (
                  <SelectedCell
                    key={id}
                    name={name}
                    type={serializeCategories(categories)}
                    avatar={s3ToUrl(thumbnailS3Key)}
                    className={idx === 0 ? 'pr-2' : 'pl-2'}
                  />
                );
              })}
            </div>

            <div className='min-h-0 flex-1'>
              <CompareCompleteTabs left={left} right={right} />
            </div>
          </>
        )}
      </div>
    </SafeArea>
  );
}

export { CompareCompletePage };
