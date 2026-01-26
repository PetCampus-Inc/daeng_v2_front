'use client';

import { useRef } from 'react';
import { Divider, ActionButton } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { useRecentKindergartenView } from '../model/useRecentKindergartenView';

import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { useKindergartenTab } from '@widgets/kindergarten-tabs/model';
import { Header } from '@widgets/Header';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import { PhoneCallSheet } from '@features/kindergarten-list';
import { BookmarkToggleIcon } from '@entities/bookmark';
import { useCurrentLocation } from '@shared/lib/geolocation';
import { useShare } from '@shared/lib/device';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

function KindergartenDetailPage() {
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [, setActiveTab] = useKindergartenTab();

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { back } = useStackNavigation();
  const navResult = useNavigationResult<boolean>();
  const { position } = useCurrentLocation();
  const { lng, lat } = position || { lng: 126.883439, lat: 37.511281 };

  const { data: kindergartenMain } = useKindergartenMainQuery({ id, lng, lat });

  const share = useShare();

  /** 최근 본 업체 저장 */
  useRecentKindergartenView(kindergartenMain);

  if (lng == null || lat == null || !kindergartenMain) return null;

  const { banner: images, ...restKindergartenMainData } = kindergartenMain;

  const openPhoneCallSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet phoneNumber={kindergartenMain.phoneNumber} isOpen={isOpen} close={close} />
    ));
  };

  const handleShare = () => {
    const shareData = {
      message: `${kindergartenMain.title}\n ${process.env.NEXT_PUBLIC_WEB_URL}/kindergarten/${kindergartenMain.id}`,
      url: `${process.env.NEXT_PUBLIC_WEB_URL}/kindergarten/${kindergartenMain.id}`,
    };
    share(shareData);
  };

  const handleHomeClick = () => {
    navResult.send(true);
    back();
  };

  const handleReviewClick = () => {
    setActiveTab('후기'); // 후기 탭 활성화
  };

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
          <Header.HomeButton onClick={handleHomeClick} />
        </Header.LeftSection>

        <Header.Title>{kindergartenMain?.title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton onClick={handleShare} />
        </Header.RightSection>
      </Header>
      <div className='h-[calc(100vh-206px)] overflow-y-auto' ref={scrollableDivRef}>
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
          <KindergartenTabs kindergartenId={id} scrollableDivRef={scrollableDivRef} />
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <div className='absolute bottom-3 z-10 flex w-full items-center gap-1 bg-white p-4'>
        <ActionButton
          disabled={!kindergartenMain.phoneNumber}
          variant='primaryLine'
          className='flex-1'
          onClick={openPhoneCallSheet}
        >
          전화 걸기
        </ActionButton>
        <ActionButton className='flex-1' onClick={handleReviewClick}>
          후기보기
        </ActionButton>

        <BookmarkToggleIcon id={id} bookmarked={kindergartenMain?.bookmarked ?? false} />
      </div>
    </>
  );
}

export { KindergartenDetailPage };
