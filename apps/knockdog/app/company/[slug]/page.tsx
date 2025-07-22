'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import img from './img.png';
import img2 from './img2.png';
import img3 from './img3.jpg';
import { Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import 'swiper/css';
import { useHeaderContext } from '@widgets/Header';
import { RecommendedDogSchoolSection } from '@features/dog-school';
import {
  DogSchoolImageSwiper,
  ReviewSection,
  DefaultInfoSection,
  PriceSection,
  DogSchoolDetail,
} from '@entities/dog-school';

export default function Page() {
  const { slug } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const { setVariant, setTitle, setTextColor } = useHeaderContext();
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle('바우라움 유치원');
  }, [setTitle]);

  const handleScrollToDivider = () => {
    if (!dividerRef.current) return;

    const headerHeight = 66;

    const rect = dividerRef.current.getBoundingClientRect();
    const scrollTop = scrollableDivRef.current?.scrollTop ?? 0;
    const targetY = rect.top - headerHeight + scrollTop;

    scrollableDivRef.current?.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <div
        className='mt-[66px] h-[calc(100vh-210px)] overflow-y-auto'
        ref={scrollableDivRef} // ref 할당
      >
        {/* 업체 메인이미지 슬라이드형 */}
        <DogSchoolImageSwiper images={[img, img2, img3]} />
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
          <div ref={dividerRef} className='bg-line-100 h-2' />
          {/* 세부 컨텐츠 영역 */}
          {/* 탭 */}

          <Tabs defaultValue='기본정보' ref={tabsRef}>
            <TabsList scrollable className='sticky top-0 z-10 bg-white'>
              <TabsTrigger value='기본정보'>기본정보</TabsTrigger>
              <TabsTrigger value='요금'>요금</TabsTrigger>
              <TabsTrigger value='후기'>후기</TabsTrigger>
              <TabsTrigger value='메모'>메모</TabsTrigger>
            </TabsList>
            <TabsContent value='기본정보'>
              <>
                <DefaultInfoSection />
                {/* Divider */}
                <div className='bg-line-100 mb-12 h-2' />

                {/* 이 근처 다른 유치원은 어때요? */}
                <RecommendedDogSchoolSection />
              </>
            </TabsContent>
            <TabsContent value='요금'>
              <PriceSection />
            </TabsContent>
            <TabsContent value='후기'>
              <ReviewSection
                onScrollTop={handleScrollToDivider}
                reviews={[
                  {
                    image:
                      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
                    name: '옌아',
                    title: '바우라움 유치원 내돈내산 이용후기',
                    content:
                      '바우라움 유치원 내돈내산 이용후기를 가져왔어요 하핫 우리 뚜비는 바우라움만 가면 폭식을 한답니다 간식도 같이 챙겨줬는데 다',
                    date: '2025.04.5',
                  },
                  {
                    image:
                      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
                    name: '옌아',
                    title: '바우라움 유치원 내돈내산 이용후기',
                    content:
                      '바우라움 유치원 내돈내산 이용후기를 가져왔어요 하핫 우리 뚜비는 바우라움만 가면 폭식을 한답니다 간식도 같이 챙겨줬는데 다',
                    date: '2025.04.5',
                  },
                  {
                    image:
                      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d',
                    name: '옌아',
                    title: '바우라움 유치원 내돈내산 이용후기',
                    content:
                      '바우라움 유치원 내돈내산 이용후기를 가져왔어요 하핫 우리 뚜비는 바우라움만 가면 폭식을 한답니다 간식도 같이 챙겨줬는데 다',
                    date: '2025.04.5',
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value='메모'>
              <div className='mb-12 mt-8 flex flex-col gap-4 px-4'>
                <div>
                  <div className='flex items-center gap-1 py-3'>
                    <Icon icon='Note' className='text-text-accent h-7 w-7' />
                    <span className='h3-extrabold'>자유메모</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='body1-regular'>
                      자유롭게 메모를 작성하세요
                    </span>
                    {/* @TODO: 화면 이동 경로의 경우 상수 이용할것 */}
                    <Link
                      href={`/company/${slug}/edit-memo`}
                      className='text-text-tertiary flex items-center gap-1'
                    >
                      <span className='label-semibold'>편집</span>
                      <Icon icon='ChevronRight' className='h-4 w-4' />
                    </Link>
                  </div>
                  <span className='body2-regular text-text-tertiary'>
                    사진 최대 5개 등록 가능
                  </span>
                  <div className='py-3'>
                    <div className='bg-primitive-neutral-50 rounded-lg px-4 py-3'>
                      <textarea
                        readOnly
                        cols={5}
                        className='bg-primitive-neutral-50 body1-regular h-[144px] w-full'
                        value='우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리우리 뽀삐는 말이에요 우리 뽀삐는 말이에요 우리는 말이에요 우에요 우리 뽀삐는 말이에요 뽀삐는 말뽀삐는 말말우리 우리뽀삐우리별이 우리 달이 강아지 고양이 귀여워'
                      />
                    </div>
                  </div>
                  {/* 사진 없는 경우 */}
                  <div className='mb-3'>
                    <button className='body2-bold text-text-tertiary flex w-full items-center justify-center gap-1 rounded-lg border border-neutral-400 px-4 py-[14px]'>
                      <Icon icon='Plus' className='inline-block h-5 w-5' />
                      <span>사진등록</span>
                    </button>
                  </div>
                  {/* 사진 리스트 */}
                  <div className='scrollbar-hide flex gap-3 overflow-x-auto py-3'>
                    <div className='body1-regular text-text-tertiary flex h-[80px] w-[80px] min-w-[80px] shrink-0 flex-col items-center justify-center rounded-lg border border-neutral-400 py-5'>
                      <Icon icon='Plus' className='h-5 w-5' />
                      <span className='body2-regular'>2/5</span>
                    </div>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className='relative h-[80px] w-[80px] min-w-[80px] shrink-0'
                      >
                        <Image
                          src={img}
                          fill
                          alt='페이지 이미지'
                          className='rounded-lg'
                        />
                        <Icon
                          icon='Close'
                          className='absolute right-1 top-1 h-6 w-6'
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className='mb-2 flex justify-between gap-1 py-3'>
                    <div className='flex items-center gap-1'>
                      <Icon icon='Note' className='text-text-accent h-7 w-7' />
                      <span className='h3-extrabold'>상담시 체크리스트</span>
                    </div>
                    {/* @TODO: 화면 이동 경우 상수 이용할것 */}
                    <Link
                      href={`/company/${slug}/edit-checklist`}
                      className='text-text-tertiary flex items-center gap-1'
                    >
                      <span className='label-semibold'>편집</span>
                      <Icon icon='ChevronRight' className='h-4 w-4' />
                    </Link>
                  </div>
                  <div className='py-3'>
                    <div className='mb-3'>
                      <span className='body2-regular'>등록요건</span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <div className='bg-fill-secondary-700 body2-semibold text-text-primary-inverse inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>백신 접종 증명서</span>
                        <Icon icon='CheckFill' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-700 text-text-primary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>중성화</span>
                        <Icon icon='CheckFill' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-50 text-text-secondary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>견종 체험 등록</span>
                      </div>
                    </div>
                  </div>
                  <div className='py-3'>
                    <div className='mb-3'>
                      <span className='body2-regular'>강아지 맞춤 관리</span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <div className='bg-fill-secondary-700 body2-semibold text-text-primary-inverse inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>분반</span>
                        <Icon icon='CheckFill' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-700 text-text-primary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>성격진단</span>
                        <Icon icon='CheckFill' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-700 text-text-primary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>맞춤일정</span>
                        <Icon icon='None' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-50 text-text-secondary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>총원</span>
                      </div>
                    </div>
                  </div>
                  <div className='py-3'>
                    <div className='mb-3'>
                      <span className='body2-regular'>식사 및 프로그램</span>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <div className='bg-fill-secondary-700 body2-semibold text-text-primary-inverse inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>맞춤배급</span>
                        <Icon icon='CheckFill' className='h-5 w-5 text-white' />
                      </div>
                      <div className='bg-fill-secondary-700 text-text-primary-inverse body2-semibold inline-flex gap-1 rounded-lg px-[14px] py-[9px]'>
                        <span className='body2-semibold'>커리큘럼</span>
                        <Icon icon='Close' className='h-5 w-5 text-white' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          {/* 상세 컨텐츠 */}
        </div>
      </div>
      {/* 하단 고정 버튼 영역 */}
      <div className='z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <button className='text-text-accent border-accent body2-bold flex-1 rounded-lg border px-4 py-[14px]'>
          길찾기
        </button>
        <button className='bg-fill-primary-500 body2-bold h-12 flex-1 rounded-lg px-4 py-[14px] text-neutral-100'>
          비교하기
        </button>

        <button className='text-text-accent flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50'>
          <Icon icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'} />
        </button>
      </div>
    </>
  );
}
