import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { KindergartenMainBox, MainBannerSwiper, useKindergartenMainQuery } from '@features/kindergarten-main';
import { useCurrentLocation } from '@shared/lib';

interface KindergartenDetailProps {
  kindergartenId: string;
  onPhoneCall?: () => void;
  onBookmarkClick?: (id: string, isBookmarked: boolean) => void;
}

export function KindergartenDetail({ kindergartenId, onPhoneCall, onBookmarkClick }: KindergartenDetailProps) {
  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: kindergartenMain } = useKindergartenMainQuery({
    id: kindergartenId,
    lng,
    lat,
    enabled: Boolean(kindergartenId && lng != null && lat != null),
  });

  if (lng == null || lat == null || !kindergartenMain) return null;
  const { banner: images, ...restKindergartenMainData } = kindergartenMain;

  return (
    <>
      <div>
        {/* 업체 메인이미지 슬라이드형 */}
        <MainBannerSwiper images={images ?? []} />
      </div>

      {/* 컨텐츠 영역 */}
      <div className='relative'>
        <div className='absolute top-[-50px]' />
        {/* 대표 컨텐츠 영역 */}
        <KindergartenMainBox {...restKindergartenMainData} />
        {/* Divider */}
        <Divider size='thick' />
        {/* 세부 컨텐츠 영역 */}
        {/* 탭 */}
        <KindergartenTabs kindergartenId={kindergartenId} />

        {/* 하단 공간 (액션 바 높이) */}
        <div className='h-14 w-full' />
      </div>

      {/* <div className='p-x4 gap-x2 flex items-center bg-white pb-[calc(env(safe-area-inset-bottom)+16px)]'>
        <ActionButton variant='primaryLine' size='medium' onClick={onPhoneCall}>
          전화하기
        </ActionButton>
        <ActionButton variant='primaryFill' size='medium' disabled>
          비교하기
        </ActionButton>
        <button
          aria-label='보관하기'
          className='radius-r3 bg-fill-primary-50 flex size-[44px] shrink-0 items-center justify-center'
          onClick={() => onBookmarkClick(kindergartenId, isBookmarked ?? false)}
        >
          <Icon icon={props.isBookmarked ? 'BookmarkFill' : 'BookmarkLine'} className='size-x6 text-fill-primary-500' />
        </button>
        </div> */}
    </>
  );
}
