'use client';

import { useRef } from 'react';
import { Divider, ActionButton } from '@knockdog/ui';

import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { Header } from '@widgets/Header';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import { useCurrentLocation } from '@shared/lib/geolocation';
import { useParams } from 'next/navigation';
import { BookmarkToggleIcon } from '@entities/bookmark';
import { PhoneCallSheet } from '@entities/kindergarten';
import { overlay } from 'overlay-kit';
import { useShare } from '@shared/lib/device';

function KindergartenDetailPage() {
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const rawId = (params as Record<string, string | string[] | undefined>)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) return null;

  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: kindergartenMain } = useKindergartenMainQuery({
    id,
    lng,
    lat,
    enabled: Boolean(id && lng && lat),
  });

  const share = useShare();

  if (!lng || !lat || !kindergartenMain) return null;

  const { banner: images, ...restKindergartenMainData } = kindergartenMain;

  const openPhoneCallSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet phoneNumber={kindergartenMain.phoneNumber} isOpen={isOpen} close={close} />
    ));
  };

  const handleShare = () => {
    const shareData = {
      // message: kindergartenMain.title,
      url: `https://knockdog.com/kindergarten/${id}`,
    };

    share(shareData);
  };

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
          <Header.HomeButton />
        </Header.LeftSection>

        <Header.Title>{kindergartenMain?.title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton onClick={handleShare} />
        </Header.RightSection>
      </Header>
      <div className='mb-[80px] mt-[66px] h-[calc(100vh-146px)] overflow-y-auto' ref={scrollableDivRef}>
        <div className='mt-[66px]'>
          {/* 업체 메인이미지 슬라이드형 */}
          {/* <MainBannerSwiper images={images ?? []} /> */}
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
          <KindergartenTabs scrollableDivRef={scrollableDivRef} />
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <div className='absolute bottom-0 z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton variant='primaryLine' className='flex-1' onClick={openPhoneCallSheet}>
          전화 걸기
        </ActionButton>
        {/* @TODO 비교하기 페이지로 Route */}
        <ActionButton className='flex-1'>비교하기</ActionButton>

        <BookmarkToggleIcon id={id} bookmarked={kindergartenMain?.bookmarked ?? false} />
      </div>
    </>
  );
}

export { KindergartenDetailPage };
