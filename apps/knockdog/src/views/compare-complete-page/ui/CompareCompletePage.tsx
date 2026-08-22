'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@widgets/Header';
import { CompareCompleteTabs } from '@widgets/compare-complete-tabs';
import { useComparisonsQuery } from '@features/compare';
import type { KindergartenComparison, ReferencePointType } from '@entities/compare';
import {
  SelectedCell,
  serializeCategories,
  resolveIds,
  s3ToUrl,
  resolveCoords,
  REFERENCE_POINT_TYPE,
} from '@entities/compare';
import type { UserAddress } from '@entities/user';
import { useUserStore } from '@entities/user';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import { useShare } from '@shared/lib/device/useShare';
import { isNativeWebView } from '@shared/lib/device';

function CompareCompletePage() {
  const params = useSearchParams();
  const share = useShare();
  const user = useUserStore((state) => state.user);
  const savedAddresses = user?.addresses;
  const isNative = useMemo(() => isNativeWebView(), []);

  // 🔒 안정화: params 객체 대신 문자열 키를 메모이즈해서 파싱
  const qsKey = params.toString();
  const ids = useMemo(() => resolveIds(new URLSearchParams(qsKey)), [qsKey]);
  const coords = useMemo(() => resolveCoords(new URLSearchParams(qsKey)), [qsKey]);

  const [referencePoint, setReferencePoint] = useState<ReferencePointType>(coords ? 'OTHER' : 'HOME'); // URL로 공유된 위치라면 OTHER
  const addressOptions = useMemo(
    () =>
      (savedAddresses ?? [])
        .filter((addr): addr is UserAddress & { alias: string } => !!addr.alias)
        .map(({ type, alias }) => ({
          value: type as ReferencePointType,
          label: alias,
        })),
    [savedAddresses]
  );
  const referencePointOptions = coords // URL로 공유된 위치인 경우 기준점 옵션
    ? [{ value: 'OTHER' as ReferencePointType, label: REFERENCE_POINT_TYPE.OTHER }]
    : addressOptions;

  const { data, isPending } = useComparisonsQuery(ids, coords);

  const [left, right] = useMemo(() => data?.filter((item): item is KindergartenComparison => !!item) ?? [], [data]);

  const handleShare = () => {
    // 현재 기준점의 좌표를 추출
    const selectedAddress: UserAddress | undefined =
      user?.addresses?.find((addr) => addr.type === referencePoint) ?? user?.addresses?.[0];

    if (!left || !right || !selectedAddress) return;

    const url = `https://app.knockdog.net/compare-complete?ids=${left.id},${right.id}&lat=${selectedAddress.lat}&lng=${selectedAddress.lng}`;

    const shareData = {
      message: `${left.name}와 ${right.name}의 비교 결과를 확인해보세요!\n ${url}`,
      url,
    };

    share(shareData);
  };

  return (
    <div className='flex h-full flex-col bg-white'>
      <Header>
        <Header.LeftSection>{isNative && <Header.BackButton />}</Header.LeftSection>
        <Header.Title>비교 결과</Header.Title>
        <Header.RightSection>
          {!coords && (
            <button
              type='button'
              className='label-semibold text-text-primary px-2 py-1'
              aria-label='비교 결과 공유하기'
              onClick={handleShare}
            >
              공유하기
            </button>
          )}
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
            <CompareCompleteTabs
              left={left}
              right={right}
              referencePoint={referencePoint}
              referencePointOptions={referencePointOptions}
              onReferencePointChange={setReferencePoint}
            />
          </div>
        </>
      )}
    </div>
  );
}

export { CompareCompletePage };
