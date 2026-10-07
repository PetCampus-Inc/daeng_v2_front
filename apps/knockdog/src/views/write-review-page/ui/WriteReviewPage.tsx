'use client';

import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { useParams } from 'next/navigation';

import { Header } from '@widgets/Header';
import { useKindergartenMainQuery } from '@features/kindergarten-main';
import { useBasePoint } from '@entities/user';
import { resolvePublicImageSrc } from '@shared/lib/utils';
import { Skeleton } from '@shared/ui/skeleton';

const FALLBACK_COORD = { lng: 126.883439, lat: 37.511281 };

const REVIEW_PLACEHOLDER =
  '유치원 이용에 대한 경험과 팁을 작성해 주세요. 적절하지 않은 내용은 삭제될 수 있어요.';
const REVIEW_NOTICES = [
  '유치원 경험과 관련된 내용만 작성해 주세요.',
  '개인정보, 허위사실, 비방∙욕설, 광고성 내용, 무단 복사한 사진이나 글이 포함되면 숨김 또는 삭제될 수 있어요.',
] as const;

function ReviewStars() {
  return (
    <div className='mt-4 flex w-60 items-center justify-between'>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className='flex size-10 items-center justify-center'>
          {/* eslint-disable-next-line @next/next/no-img-element -- 별 SVG 원본 크기 유지 */}
          <img src='/images/img_review_star.svg' alt='' />
        </div>
      ))}
    </div>
  );
}

function KindergartenSummary({ id }: { id: string }) {
  const { coord } = useBasePoint();
  const { data, isLoading } = useKindergartenMainQuery({
    id,
    lng: coord?.lng ?? FALLBACK_COORD.lng,
    lat: coord?.lat ?? FALLBACK_COORD.lat,
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className='flex items-center gap-2 px-4 py-5'>
        <Skeleton className='radius-r2 size-11 shrink-0' />
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-5 w-52' />
        </div>
      </div>
    );
  }

  const imageSrc = resolvePublicImageSrc(data?.banner?.[0]);

  return (
    <div className='flex items-center gap-2 px-4 py-5'>
      {imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- 썸네일은 절대 URL 또는 S3 키
        <img src={imageSrc} alt='' className='radius-r2 size-11 shrink-0 object-cover' />
      ) : (
        <div className='bg-bg-50 radius-r2 size-11 shrink-0' />
      )}
      <div className='min-w-0 flex-1'>
        <p className='body1-bold text-text-primary truncate'>{data?.title}</p>
        <p className='body2-regular text-text-secondary truncate'>{data?.roadAddress}</p>
      </div>
    </div>
  );
}

export function WriteReviewPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  if (!id) throw new Error('Company ID is required for write review page');

  return (
    <div className='bg-bg-0 flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>유치원 후기 작성</Header.Title>
      </Header>

      <div className='min-h-0 flex-1 overflow-y-auto'>
        <KindergartenSummary id={id} />
        <Divider size='thick' />

        <div className='flex flex-col items-center pt-6'>
          <p className='h3-semibold text-text-primary'>유치원은 만족하셨나요?</p>
          <ReviewStars />
          <p className='body1-bold text-fill-secondary-500 mt-2'>(0)</p>
        </div>

        <div className='mt-5 flex flex-col gap-2 px-4 py-3'>
          <p className='body2-bold text-text-primary'>리뷰 작성</p>
          <div className='bg-bg-50 radius-r2 flex flex-col gap-8 px-4 py-3'>
            <p className='body1-regular text-fill-secondary-500'>{REVIEW_PLACEHOLDER}</p>
            <p className='body2-regular text-text-caption'>0/2,000</p>
          </div>
        </div>

        <div className='flex flex-col gap-2 px-4'>
          <p className='body2-bold text-text-primary'>사진 등록</p>
          <div className='bg-bg-50 radius-r2 flex size-[72px] items-center justify-center'>
            <Icon icon='Plus' className='text-fill-secondary-500 size-5' />
          </div>
        </div>

        <div className='mt-5 px-4 pb-4'>
          <div className='bg-bg-50 radius-r4 p-4'>
            <ul className='body2-regular text-fill-secondary-500 list-disc pl-[21px] [&>li:not(:last-child)]:mb-2.5'>
              {REVIEW_NOTICES.map((notice) => (
                <li key={notice}>{notice}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className='bg-bg-0 shrink-0 p-4'>
        <ActionButton type='button' size='large' disabled>
          등록하기
        </ActionButton>
      </div>
    </div>
  );
}
