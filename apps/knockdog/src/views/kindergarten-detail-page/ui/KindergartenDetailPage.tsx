'use client';

import { useRef } from 'react';
import { Divider, ActionButton, Icon } from '@knockdog/ui';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { useRecentKindergartenView } from '../model/useRecentKindergartenView';

import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { useKindergartenTab } from '@widgets/kindergarten-tabs/model';
import { Header } from '@widgets/Header';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import { PhoneCallSheet } from '@features/kindergarten-list';
import { useDetailBookmarkToggle } from '@features/kindergarten-list/model/useDetailBookmarkToggle';
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
  const { mutate: toggleBookmark } = useDetailBookmarkToggle({ id, lng, lat });

  const share = useShare();

  /** 최근 본 업체 저장 */
  useRecentKindergartenView(kindergartenMain);

  if (lng == null || lat == null || !kindergartenMain) return null;

  const { banner: images, ...restKindergartenMainData } = kindergartenMain;

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

  const handleBookmarkClick = (targetId: string, bookmarked: boolean) => toggleBookmark({ id: targetId, bookmarked });

  const openPhoneCallSheet = () => {
    overlay.open(({ isOpen, close }) => (
      <PhoneCallSheet phoneNumber={kindergartenMain.phoneNumber} isOpen={isOpen} close={close} />
    ));
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
      <div className='flex h-[calc(100%-var(--top-bar-height))] w-full flex-col'>
        <main className='flex-1 overflow-y-auto' ref={scrollableDivRef}>
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
        </main>
        {/* 하단 고정 버튼 영역 */}
        <aside className='gap-x2 p-x4 flex w-full max-w-screen-sm shrink-0 items-center border-t border-t-gray-100 bg-white'>
          <ActionButton disabled={!kindergartenMain.phoneNumber} variant='primaryLine' onClick={openPhoneCallSheet}>
            전화하기
          </ActionButton>
          <ActionButton variant='primaryFill' onClick={handleReviewClick}>
            후기보기
          </ActionButton>
          <button
            aria-label='보관하기'
            className='radius-r3 bg-fill-primary-50 flex size-11 shrink-0 items-center justify-center'
            onClick={() => handleBookmarkClick(kindergartenMain.id, kindergartenMain.bookmarked ?? false)}
          >
            <Icon
              icon={kindergartenMain.bookmarked ? 'BookmarkFill' : 'BookmarkLine'}
              className='size-x6 text-fill-primary-500'
            />
          </button>
        </aside>
      </div>
    </>
  );
}

export { KindergartenDetailPage };
