'use client';

import { useEffect, useState, useRef } from 'react';
import { Icon, ActionButton, Divider } from '@knockdog/ui';

import 'swiper/css';
import { DogSchoolTabs } from '@widgets/dog-school-tabs';
import { useHeaderContext } from '@widgets/Header';
import { DogSchoolImageSwiper, DogSchoolDetail } from '@entities/dog-school';

export default function Page() {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('바우라움 유치원');
  }, [setTitle]);

  return (
    <>
      <div
        className='mt-[66px] h-[calc(100vh-210px)] overflow-y-auto'
        ref={scrollableDivRef} // ref 할당
      >
        {/* 업체 메인이미지 슬라이드형 */}
        <DogSchoolImageSwiper
          images={[
            'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
            'https://images.unsplash.com/random',
            'https://images.unsplash.com/photo-1391060870165-09b84787e704',
          ]}
        />
        {/* 컨텐츠 영역 */}
        <div className='relative'>
          <div className='absolute top-[-50px]' />
          {/* 대표 컨텐츠 영역 */}
          <DogSchoolDetail
            id='1'
            title='바우라움 유치원'
            ctg='유치원,호텔'
            dist={10.9}
            roadAddress='서울 강남구 논현로 123길 37'
            operationStatus='OPEN'
            serviceTags={['WALK', 'TRAINING', 'GROOMING']}
            pickupType='FREE'
            price={300000}
            reviewCount={500}
            memo={{
              id: '1',
              shopId: '1',
              content: '바우라움 유치원 내돈내산 이용후기',
              updatedAt: '2025.04.15',
            }}
            coord={{
              lat: 37.511281,
              lng: 126.883439,
            }}
            operationTimes={{
              startTime: '09:00',
              endTime: '20:00',
            }}
            operationDescription='20:00에 영업종료'
          />
          {/* Divider */}
          <Divider size='thick' />
          {/* 세부 컨텐츠 영역 */}
          {/* 탭 */}
          <DogSchoolTabs scrollableDivRef={scrollableDivRef} />
          {/* 상세 컨텐츠 */}
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <div className='z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton variant='primaryLine' className='flex-1'>
          길찾기
        </ActionButton>
        <ActionButton className='flex-1'>비교하기</ActionButton>

        <button
          onClick={() => setIsBookmarked(!isBookmarked)}
          className='text-text-accent flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50'
        >
          <Icon icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'} />
        </button>
      </div>
    </>
  );
}
