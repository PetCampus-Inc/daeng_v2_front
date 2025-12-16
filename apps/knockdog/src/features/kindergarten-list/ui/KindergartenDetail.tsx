import { Divider } from '@knockdog/ui';
import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { KindergartenMainBox, MainBannerSwiper, useKindergartenMainQuery } from '@features/kindergarten-main';
import { useCurrentLocation } from '@shared/lib';

interface KindergartenDetailProps {
  kindergartenId: string;
}

export function KindergartenDetail({ kindergartenId }: KindergartenDetailProps) {
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
      </div>
    </>
  );
}
