'use client';

import { useMemo, useRef } from 'react';
import { Divider, ActionButton, Icon } from '@knockdog/ui';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { overlay } from 'overlay-kit';
import { useRecentKindergartenView } from '../model/useRecentKindergartenView';

import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { useKindergartenTab } from '@widgets/kindergarten-tabs/model';
import { Header } from '@widgets/Header';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import { PhoneCallSheet } from '@features/kindergarten-list';
import { useDetailBookmarkToggle } from '@features/kindergarten-list/model/useDetailBookmarkToggle';
import { isNativeWebView, useShare } from '@shared/lib/device';
import { getCurrentTxId, useNavigationResult, useStackNavigation, useTabNavigation } from '@shared/lib/bridge';
import { useScreenAnalyticsTitle } from '@shared/lib/analytics';
import { useBasePoint } from '@entities/user';
import { PageError } from '@shared/ui/page-error';
import { DelayedLoadingSpinner } from '@shared/ui/loading-spinner';

/** 기준점(현위치/집/회사) 미준비 시 거리 계산용 폴백 — 비교 상세와 동일 */
const FALLBACK_COORD = { lng: 126.883439, lat: 37.511281 };

function ClosedKindergartenNotice() {
  return (
    <div className='flex flex-col items-center gap-5 bg-white pb-12'>
      <Image
        src='/images/img_empty_result.png'
        alt='운영 종료 안내 이미지'
        width={200}
        height={200}
        priority
        className='block'
      />
      <div className='flex h-[80px] w-[214px] flex-col items-center gap-1'>
        <p className='h2-extrabold text-text-primary w-full text-center'>운영이 종료된 유치원이에요</p>
        <p className='body1-regular text-text-primary w-full whitespace-pre-line text-center'>
          {'이 유치원의 상세 정보는\n더 이상 제공되지 않아요.'}
        </p>
      </div>
    </div>
  );
}

function KindergartenDetailPage() {
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useKindergartenTab();

  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { back } = useStackNavigation();
  const { navigateToTab } = useTabNavigation();
  const navResult = useNavigationResult<boolean>();
  const { coord } = useBasePoint();
  const lng = coord?.lng ?? FALLBACK_COORD.lng;
  const lat = coord?.lat ?? FALLBACK_COORD.lat;

  const {
    data: kindergartenMain,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useKindergartenMainQuery({
    id,
    lng,
    lat,
    enabled: Boolean(id),
  });
  const { mutate: toggleBookmark } = useDetailBookmarkToggle({
    id,
    lng,
    lat,
  });

  const share = useShare();
  const isNative = useMemo(() => isNativeWebView(), []);

  /** GA 화면명 = 유치원명 (v2 page_title과 동일) */
  useScreenAnalyticsTitle(kindergartenMain?.title);

  /** 최근 본 업체 저장 */
  useRecentKindergartenView(kindergartenMain);

  const renderErrorPage = (onRetry: () => void, isRetrying = false) => (
    <div className='bg-bg-0 flex h-dvh flex-col'>
      <Header>
        <Header.LeftSection>{isNative ? <Header.BackButton /> : null}</Header.LeftSection>
      </Header>
      <PageError layout='inline' isRetrying={isRetrying} onRetry={onRetry} />
    </div>
  );

  if (!id) {
    return renderErrorPage(() => void back());
  }

  if (isError) {
    return renderErrorPage(() => void refetch(), isFetching);
  }

  if (isPending || !kindergartenMain) {
    return (
      <div className='bg-bg-0 flex h-dvh flex-col'>
        <Header>
          <Header.LeftSection>{isNative ? <Header.BackButton /> : null}</Header.LeftSection>
        </Header>
        <DelayedLoadingSpinner isLoading={isPending} layout='content' />
      </div>
    );
  }

  const bannerImages = (kindergartenMain.banner ?? []).filter(Boolean);
  const isClosed = kindergartenMain.schoolStatus === 'CLOSED';

  const handleShare = () => {
    const shareData = {
      url: `${process.env.NEXT_PUBLIC_WEB_URL}/kindergarten/${kindergartenMain.id}`,
    };
    share(shareData);
  };

  const handleHomeClick = () => {
    if (getCurrentTxId()) {
      navResult.send(true);
      void back();
      return;
    }

    void navigateToTab('/');
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
          {isNative && (
            <>
              <Header.BackButton />
              <Header.HomeButton onClick={handleHomeClick} />
            </>
          )}
        </Header.LeftSection>

        <Header.CenterSection>
          <h1 className='h3-extrabold text-text-primary max-w-[200px] truncate text-center'>
            {kindergartenMain?.title}
          </h1>
        </Header.CenterSection>

        <Header.RightSection>
          <Header.ShareButton onClick={handleShare} />
        </Header.RightSection>
      </Header>
      <div className='flex h-[calc(100%-var(--top-bar-height))] w-full flex-col'>
        <main className='flex-1 overflow-y-auto' ref={scrollableDivRef}>
          <div>
            {/* 업체 메인이미지 슬라이드형 */}
            <MainBannerSwiper images={bannerImages} />
          </div>

          {/* 컨텐츠 영역 */}
          <div className='relative'>
            <div className='absolute top-[-50px]' />
            {/* 대표 컨텐츠 영역 */}
            <KindergartenMainBox {...kindergartenMain} compact={isClosed} />
            {isClosed && <ClosedKindergartenNotice />}
            {/* Divider */}
            {!isClosed && <Divider size='thick' />}
            {/* 세부 컨텐츠 영역 */}
            {/* 탭 */}
            <KindergartenTabs
              kindergartenId={id}
              scrollableDivRef={scrollableDivRef}
              hideDetailTabs={isClosed}
              value={activeTab}
              onValueChange={setActiveTab}
            />
          </div>
        </main>
        {/* 하단 고정 버튼 영역 */}
        {isClosed ? (
          <aside className='flex h-24 w-full shrink-0 bg-white px-4 py-5'>
            <button
              type='button'
              disabled
              className='body1-bold h-14 w-full rounded-lg bg-fill-secondary-100 text-text-secondary-inverse'
            >
              운영이 종료된 곳입니다
            </button>
          </aside>
        ) : (
          <aside className='gap-x2 p-x4 flex w-full shrink-0 items-center border-t border-t-gray-100 bg-white'>
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
        )}
      </div>
    </>
  );
}

export { KindergartenDetailPage };
