'use client';

import { useState, useRef } from 'react';
import { Divider, ActionButton } from '@knockdog/ui';

import { DogSchoolImageSwiper, DogSchoolDetail } from '@entities/dog-school';
import { KindergartenTabs } from '@widgets/kindergarten-tabs';
import { Header } from '@widgets/Header';
import { useKindergartenMainQuery, KindergartenMainBox, MainBannerSwiper } from '@features/kindergarten-main';
import { useCurrentLocation } from '@shared/lib/geolocation';
import { useParams } from 'next/navigation';
import { BookmarkToggleIcon } from '@entities/bookmark';

function KindergartenDetailPage() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const rawId = (params as Record<string, string | string[] | undefined>)?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  if (!id) throw new Error('Kindergarten ID is required');

  // const position = useCurrentLocation();
  // if (!position) return null;

  const position = { lng: 126.883439, lat: 37.511281 };

  const { data: kindergartenMain } = useKindergartenMainQuery(id, position.lng, position.lat);

  if (!kindergartenMain) return null;

  const { images, ...restKindergartenMainData } = kindergartenMain;

  return (
    <>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
          <Header.HomeButton />
        </Header.LeftSection>

        <Header.Title>{kindergartenMain?.title}</Header.Title>

        <Header.RightSection>
          <Header.ShareButton />
        </Header.RightSection>
      </Header>
      <div
        className='mt-[66px] overflow-y-auto'
        ref={scrollableDivRef} // ref 할당
      >
        <div className='mt-[66px]'>
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
          <KindergartenTabs scrollableDivRef={scrollableDivRef} />
          {/* 상세 컨텐츠 */}
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <div className='z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton variant='primaryLine' className='flex-1'>
          길찾기
        </ActionButton>
        <ActionButton className='flex-1'>비교하기</ActionButton>

        <BookmarkToggleIcon id={id} bookmarked={kindergartenMain?.bookmarked ?? false} />
      </div>
    </>
  );
}

export { KindergartenDetailPage };
