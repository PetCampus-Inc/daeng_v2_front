'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import img from './img.png';
import img2 from './img2.png';
import img3 from './img3.jpg';
import { Icon } from '@knockdog/ui';
import { Swiper, SwiperSlide } from 'swiper/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import 'swiper/css';
import { useHeaderContext } from '@widgets/Header/model/HeaderProvider';
import { createPath } from '@shared/lib/path';

export default function Page() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('기본정보');
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(3); // 실제 슬라이드 개수에 맞게 초기화
  const scrollableDivRef = useRef<HTMLDivElement>(null);
  const reviewsTabRef = useRef<HTMLDivElement>(null); // 후기 탭 ref 추가
  const infoObserverRef = useRef<HTMLDivElement>(null); // 기본정보 탭 ref 추가
  const { setVariant, setTitle, setTextColor } = useHeaderContext();
  const { slug } = useParams();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          setTextColor('text-black');
          setVariant('solid');
        } else {
          setTextColor('text-white');
          setVariant('transparent');
        }
      },
      {
        threshold: 0,
      }
    );

    const current = infoObserverRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [setTextColor, setVariant]);

  useEffect(() => {
    setTitle('바우라움 유치원');
  }, [setTitle]);

  const handleBookmarkClick = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleScrollToTop = () => {
    if (scrollableDivRef.current && reviewsTabRef.current) {
      const headerHeight = 150;
      const topPosition = reviewsTabRef.current.offsetTop - headerHeight;
      scrollableDivRef.current.scrollTo({
        top: topPosition > 0 ? topPosition : 0, // 계산된 위치가 음수면 0으로
        behavior: 'smooth',
      });
    }
  };

  return (
    <>
      <div
        className='h-[calc(100vh-150px)] overflow-y-auto'
        ref={scrollableDivRef} // ref 할당
      >
        {/* 업체 메인이미지 슬라이드형 */}
        <div>
          <Swiper
            slidesPerView={1}
            onSlideChange={(swiper) => {
              console.log('slide change');
              setCurrentSlide(swiper.activeIndex + 1);
            }}
            onSwiper={(swiper) => {
              console.log(swiper);
              // 실제 슬라이드 개수를 여기서 설정할 수도 있습니다.
              // 예: setTotalSlides(swiper.slides.length - 2); // '...' 같은 추가 요소를 고려해야 함
            }}
          >
            <SwiperSlide>
              <Image
                src={img}
                alt='페이지 이미지'
                className='h-[292px] w-full'
              />
            </SwiperSlide>
            <SwiperSlide>
              <Image
                src={img2}
                alt='페이지 이미지'
                className='h-[292px] w-full'
              />
            </SwiperSlide>
            <SwiperSlide>
              <Image
                src={img3}
                alt='페이지 이미지'
                className='h-[292px] w-full'
              />
            </SwiperSlide>
          </Swiper>

          {/* swiper 카운트 */}
          <div className='z-5 absolute bottom-10 right-4 rounded-xl bg-[#0F141A] px-[10px] py-[3px] opacity-70'>
            <div className='text-xs text-white'>
              {currentSlide} / {totalSlides}
            </div>
          </div>
        </div>
        {/* 컨텐츠 영역 */}
        <div className='relative'>
          <div ref={infoObserverRef} className='absolute top-[-50px]' />
          {/* 대표 컨텐츠 영역 */}
          <div className='relative z-10 -mt-8 flex flex-col gap-[16px] rounded-t-[20px] bg-white px-4 pb-12 pt-[20px]'>
            <div>
              <div className='flex justify-between'>
                {/* 타이틀 영역 */}
                <span className='h2-extrabold'>바우라움 유치원</span>
                <div onClick={handleBookmarkClick} className='cursor-pointer'>
                  <Icon
                    icon={isBookmarked ? 'BookmarkFill' : 'BookmarkLine'}
                    className='h-7 w-7'
                  />
                </div>
              </div>
              <div className='flex items-center'>
                <span className='body2-semibold text-tertiary'>
                  유치원 · 호텔
                </span>
              </div>
            </div>
            <div className='flex flex-col gap-[4px]'>
              <div>
                <span className='body2-extrabold mr-1 inline-block min-w-[52px]'>
                  10.9km
                </span>
                <span className='body2-regular'>
                  서울 강남구 논현로 123길 37
                </span>
              </div>
              <div>
                <span className='body2-extrabold mr-1 inline-block min-w-[52px]'>
                  영업중
                </span>
                <span className='body2-regular'>20:00에 영업종료</span>
              </div>
            </div>
            {/* 뱃지 및 가격영역 */}
            <div className='flex justify-between'>
              <div className='flex gap-1'>
                <div className='text-size-caption1 flex gap-[2px] rounded-md bg-gray-100 px-2 py-1'>
                  <Icon icon='Naver' className='h-[16px] w-[16px]' />
                  리뷰 500개
                </div>
                <div className='text-size-caption1 flex gap-[2px] rounded-md bg-gray-100 px-2 py-1'>
                  <Icon icon='Note' className='h-[16px] w-[16px]' />
                  2025.04.16 노트
                </div>
              </div>
              <span className='h3-extrabold'>1,000,000원~</span>
            </div>
            {/* Divider */}
            <div className='bg-line-200 h-px' />

            <div className='scrollbar-hide flex gap-[4px] overflow-x-auto whitespace-nowrap pb-2'>
              {/* 뱃지 리스트 */}
              <div className='bg-fill-secondary-700 text-size-caption1 flex gap-[4px] rounded-full px-2 py-1 text-white'>
                <Icon
                  icon='PickupFree'
                  className='h-[16px] w-[16px] text-white'
                />
                무료 픽드랍
              </div>
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className='text-size-caption1 bg-secondary-0 border-line-200 text-text-secondary rounded-full border px-2 py-1'
                >
                  24시간 상주 {index + 1}
                </div>
              ))}
            </div>
          </div>
          {/* Divider */}
          <div className='bg-line-100 h-2' />
          {/* 세부 컨텐츠 영역 */}
          {/* 탭 */}
          <div className='border-b-1 border-line-200 sticky top-[56px] z-10 bg-white'>
            <div className='flex px-4'>
              {/* 기본정보 */}
              <div
                onClick={() => handleTabClick('기본정보')}
                className={`body2-semibold flex-1 cursor-pointer p-4 text-center${
                  activeTab === '기본정보'
                    ? 'text-text-accent border-b-line-accent border-b-3'
                    : ''
                }`}
              >
                기본정보
              </div>
              {/* 요금 */}
              <div
                onClick={() => handleTabClick('요금')}
                className={`body2-semibold flex-1 cursor-pointer p-4 text-center ${
                  activeTab === '요금'
                    ? 'text-text-accent border-b-line-accent border-b-3'
                    : 'text-text-disabled'
                }`}
              >
                요금
              </div>

              {/* 후기 */}
              <div
                onClick={() => handleTabClick('후기')}
                className={`body2-semibold flex-1 cursor-pointer p-4 text-center ${
                  activeTab === '후기'
                    ? 'text-text-accent border-b-line-accent border-b-3'
                    : 'text-text-disabled'
                }`}
              >
                후기
              </div>
              {/* 메모 */}
              <div
                onClick={() => handleTabClick('메모')}
                className={`body2-semibold flex-1 cursor-pointer p-4 text-center ${
                  activeTab === '메모'
                    ? 'text-text-accent border-b-line-accent border-b-3'
                    : 'text-text-disabled'
                }`}
              >
                메모
              </div>
            </div>
          </div>
          {/* 상세 컨텐츠 */}
          {/* 기본정보 */}
          {activeTab === '기본정보' && (
            <>
              <div className='mb-12 mt-7 flex flex-col gap-12 px-4'>
                {/* 운영시간 */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>운영시간</span>
                  </div>
                  <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
                    <div>
                      <dt className='body2-bold mb-1'>평일</dt>

                      <div className='mb-[4px] flex'>
                        <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                          운영시간
                        </dt>
                        <dd className='body2-regular text-text-primary'>
                          08:00 - 20:00
                        </dd>
                      </div>

                      <div className='mb-[4px] flex'>
                        <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                          브레이크 타임
                        </dt>
                        <dd className='body2-regular text-text-primary'>
                          12:00 - 14:00
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className='body2-bold mb-1'>주말</dt>

                      <div className='mb-[4px] flex'>
                        <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                          운영시간
                        </dt>
                        <dd className='body2-regular text-text-primary'>
                          08:00 - 20:00
                        </dd>
                      </div>

                      <div className='mb-[4px] flex'>
                        <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                          브레이크 타임
                        </dt>
                        <dd className='body2-regular text-text-primary'>
                          12:00 - 14:00
                        </dd>
                      </div>
                    </div>
                    <div className='flex'>
                      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                        정기 휴무일
                      </dt>
                      <dd className='body2-regular text-text-primary'>
                        목요일 공휴일
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* 견종 */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>견종</span>
                  </div>
                  <div className='grid grid-cols-4 gap-3'>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Alldogs' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        견종무관
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Smalldog' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        소형견 전용
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Largedog' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        중대형견 전용
                      </span>
                    </div>
                  </div>
                </div>
                {/* 강아지 서비스 */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>강아지 서비스</span>
                  </div>
                  <div className='grid grid-cols-4 gap-3'>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Daycare' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        데이케어
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Hotel' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        호텔링
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Time24' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        24시간 상주
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Personalitycheck' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        성격성향 진단
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Babydelivery' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        분반 돌봄
                      </span>
                    </div>
                  </div>
                </div>
                {/* 강아지 안전시설 */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>강아지 안전·시설</span>
                  </div>
                  <div className='grid grid-cols-4 gap-3'>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Floor' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        미끄럼방지
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Cctv' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        CCTV
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Playground' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        놀이터
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Rooftop' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        루프탑
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Terrace' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        테라스
                      </span>
                    </div>
                  </div>
                </div>
                {/* 방문객 편의 시설 */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>방문객 편의·시설</span>
                  </div>
                  <div className='grid grid-cols-4 gap-3'>
                    <div className='flex flex-col items-center'>
                      <Icon icon='PickdropLine' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        픽드랍
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Noticebook' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        1:1알림장
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Toyshop' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        강아지 용품샵
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Cafe' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        강아지 카페
                      </span>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Icon icon='Parking' className='h-8 w-8' />
                      <span className='text-size-caption1 text-text-secondary'>
                        주차장
                      </span>
                    </div>
                  </div>
                </div>
                {/* 웹사이트 SNS */}
                <div>
                  <div className='mb-3'>
                    <span className='body1-bold'>웹사이트·SNS</span>
                  </div>
                  <dl className='bg-primitive-neutral-50 flex flex-col gap-4 rounded-lg p-4'>
                    <div className='flex'>
                      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                        홈페이지
                      </dt>
                      <dd className='body2-regular text-text-primary'>
                        www.knockdog.com
                      </dd>
                    </div>
                    <div className='flex'>
                      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                        인스타그램
                      </dt>
                      <dd className='body2-regular text-text-primary'>
                        @knockdog
                      </dd>
                    </div>
                    <div className='flex'>
                      <dt className='body2-bold text-text-tertiary mr-3 min-w-[76px]'>
                        유튜브
                      </dt>
                      <dd className='body2-regular text-text-primary'>
                        www.youtube.com/knockdog
                      </dd>
                    </div>
                  </dl>
                </div>
                {/* 위치 */}
                <div>
                  <div className='mb-3 flex justify-between'>
                    <span className='body1-bold'>웹사이트·SNS</span>
                    <a className='text-text-tertiary'>길찾기</a>
                  </div>
                  <div className='mb-2 flex items-center gap-2'>
                    <span className='body2-regular'>
                      서울특별시 강북구 미아동 345-2
                    </span>
                    <Icon icon='Copy' />
                  </div>
                  <div className='bg-primitive-neutral-50 h-[166px] rounded-lg'>
                    <div className='text-center'>지도 영역</div>
                  </div>
                </div>
                {/* 최종 정보 업데이트 */}
                <div className='flex justify-between py-4'>
                  <div className='flex flex-col'>
                    <span className='body1-bold'>최종 정보 업데이트</span>
                    <span className='body2-regular text-text-tertiary'>
                      2025-04-29
                    </span>
                  </div>
                  <div>
                    <Link
                      href={`/company/${slug}/report-info-update`}
                      className='text-text-accent text-size-caption2 border-accent rounded-lg border px-3 py-2 font-semibold'
                    >
                      정보 수정 제보하기
                    </Link>
                  </div>
                </div>
              </div>
              {/* Divider */}
              <div className='bg-line-100 mb-12 h-2' />

              {/* 이 근처 다른 유치원은 어때요? */}
              <div className='px-4'>
                <div className='mb-3'>
                  <span className='body1-bold'>
                    이 근처 다른 유치원은 어때요?
                  </span>
                </div>

                <div className='scrollbar-hide flex gap-5 overflow-x-auto'>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className='min-w-[233px]'>
                      <div className='relative mb-2 rounded-lg'>
                        <Image
                          src={img}
                          alt='페이지 이미지'
                          className='h-[142px] w-[233px] rounded-lg object-cover'
                        />
                        {/* 뱃지 리스트 */}
                        <div className='absolute bottom-2 left-2 flex gap-1'>
                          <div className='text-size-caption1 flex gap-[2px] rounded-md bg-[#0F141A] px-2 py-1 text-neutral-100 opacity-70'>
                            <Icon icon='Naver' className='h-[16px] w-[16px]' />
                            리뷰 500개
                          </div>
                          <div className='text-size-caption1 flex gap-[2px] rounded-md bg-[#0F141A] px-2 py-1 text-neutral-100 opacity-70'>
                            <Icon icon='Note' className='h-[16px] w-[16px]' />
                            2025.04.16 노트
                          </div>
                        </div>
                      </div>
                      <div className='mb-3'>
                        {/* 내용 영역 */}
                        <div className='flex justify-between'>
                          <span className='body1-extrabold'>
                            강아지 유치원 {index + 1}
                          </span>
                          <Icon icon='BookmarkFill' />
                        </div>
                        <span className='body2-regular text-text-tertiary'>
                          유치원・호텔
                        </span>
                        <div>
                          <span className='body2-bold mr-1 inline-block min-w-[13]'>
                            10.9km
                          </span>
                          <span className='body2-regular text-text-tertiary'>
                            서울 강남구 논현로 123길 37
                          </span>
                        </div>
                        <div>
                          <span className='body2-bold min-w-13 text-text-accent mr-1 inline-block'>
                            영업중
                          </span>
                          <span className='body2-regular text-text-tertiary'>
                            20:00에 영업종료
                          </span>
                        </div>
                        <div>
                          <span className='body2-bold min-w-13 mr-1 inline-block'>
                            이용요금
                          </span>
                          <span className='body2-bold'>30,000부터~</span>
                        </div>
                      </div>

                      <div className='mb-14 flex gap-1'>
                        {/* 뱃지 리스트 */}
                        <div className='bg-fill-secondary-700 text-size-caption1 flex gap-[4px] rounded-full px-2 py-1 text-white'>
                          <Icon
                            icon='PickupFree'
                            className='h-[16px] w-[16px] text-white'
                          />
                          무료 픽드랍
                        </div>
                        <div className='text-size-caption1 bg-secondary-0 border-line-200 text-text-secondary rounded-full border px-2 py-1'>
                          24시간 상주
                        </div>
                        <div className='text-primitive-neutral-500 text-size-caption1 py-1'>
                          외 +3
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === '요금' && (
            <div className='mb-12 mt-8 flex flex-col gap-12 px-4'>
              {/* 상품유형 */}
              <div>
                <div className='mb-3'>
                  <span className='body1-bold'>상품유형</span>
                  {/* 상품유형 리스트 */}
                </div>
                <div className='flex gap-3'>
                  <div className='bg-primitive-neutral-50 body2-bold flex gap-1 rounded-lg px-4 py-2'>
                    <span>횟수권</span>
                    <Icon
                      icon='CheckFill'
                      className='text-text-accent h-5 w-5'
                    />
                  </div>
                  <div className='bg-primitive-neutral-50 body2-bold flex gap-1 rounded-lg px-4 py-2'>
                    <span>정기권</span>
                    <Icon
                      icon='CheckFill'
                      className='text-text-accent h-5 w-5'
                    />
                  </div>
                  <div className='bg-primitive-neutral-50 body2-bold text-text-tertiary flex gap-1 rounded-lg px-4 py-2'>
                    <span>멤버십</span>
                    <Icon
                      icon='CheckFill'
                      className='text-fill-secondary-400 h-5 w-5'
                    />
                  </div>
                </div>
              </div>

              {/* 서비스 및 이용요금 */}
              <div>
                <div className='mb-1 flex items-center justify-between'>
                  <span className='body1-bold'>서비스 및 이용요금</span>
                  <span className='body2-bold text-neutral-500'>전화걸기</span>
                </div>
                <div className='flex flex-col gap-5'>
                  <span className='body2-regular text-text-tertiary'>
                    자세한 내용은 업체로 문의 바랍니다.
                  </span>

                  {/* Aqua Dog Fitness */}
                  <div>
                    <span className='body1-bold mb-3 inline-block'>
                      Aqua Dog Fitness
                    </span>

                    <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>-5kg</span>
                        <span className='body2-regular text-center'>5회</span>
                        <span className='body2-regular text-right'>
                          720,000원
                        </span>
                      </div>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          5kg-10kg
                        </span>
                        <span className='body2-regular text-center'>5회</span>
                        <span className='body2-regular text-right'>
                          720,000원
                        </span>
                      </div>

                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          5kg-10kg
                        </span>
                        <span className='body2-regular text-center'>15회</span>
                        <span className='body2-regular text-right'>
                          720,000원
                        </span>
                      </div>

                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>-5kg</span>
                        <span className='body2-regular text-center'>5회</span>
                        <span className='body2-regular text-right'>
                          720,000원
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Private Personal Lesson */}
                  <div>
                    <span className='body1-bold mb-3 inline-block'>
                      Private Personal Lesson
                    </span>

                    <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          전 체중
                        </span>
                        <span className='body2-regular text-center'>5회</span>
                        <span className='body2-regular text-right'>
                          750,000원
                        </span>
                      </div>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          전 체중
                        </span>
                        <span className='body2-regular text-center'>10회</span>
                        <span className='body2-regular text-right'>
                          1,500,000원
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Private Group Lesson */}
                  <div>
                    <span className='body1-bold mb-3 inline-block'>
                      Private Group Lesson
                    </span>

                    <div className='bg-primitive-neutral-50 flex flex-col gap-3 rounded-lg p-4'>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          전 체중
                        </span>
                        <span className='body2-regular text-center'>5회</span>
                        <span className='body2-regular text-right'>
                          750,000원
                        </span>
                      </div>
                      <div className='grid grid-cols-3'>
                        <span className='body2-semibold text-left'>
                          전 체중
                        </span>
                        <span className='body2-regular text-center'>10회</span>
                        <span className='body2-regular text-right'>
                          1,500,000원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 가격표 */}
              <div>
                <div className='mb-3'>
                  <span className='body1-bold mr-1'>가격표</span>
                  <span className='text-text-accent body1-bold'>4</span>
                </div>
                <div className='scrollbar-hide flex gap-[14px] overflow-x-auto'>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt='페이지 이미지'
                      className='h-[120px] w-[120px] rounded-lg'
                    />
                  ))}
                </div>
              </div>
              {/* 최종 정보 업데이트 */}
              <div className='flex justify-between py-4'>
                <div className='flex flex-col'>
                  <span className='body1-bold'>최종 정보 업데이트</span>
                  <span className='body2-regular text-text-tertiary'>
                    2025-04-29
                  </span>
                </div>
                <div>
                  <Link
                    href={`/company/${slug}/report-info-update`}
                    className='text-text-accent text-size-caption2 border-accent rounded-lg border px-3 py-2 font-semibold'
                  >
                    정보 수정 제보하기
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === '후기' && (
            <div
              ref={reviewsTabRef} // ref 할당
              className='mb-12 mt-10 flex flex-col px-4'
            >
              <div className='mb-9'>
                <div className='mb-3 flex'>
                  <div className='mr-2 rounded-lg bg-[#00C300] px-1 py-1'>
                    <Icon icon='Naver' className='h-4 w-4 text-white' />
                  </div>
                  <span className='body1-bold'>블로그 리뷰</span>
                </div>
                <div>
                  {/* 후기 리스트 */}
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className='bg-primitive-neutral-50 mb-2 flex flex-col gap-1 rounded-lg p-4'
                    >
                      <div>
                        <Image
                          src={img}
                          alt='페이지 이미지'
                          className='mr-1 inline-block h-6 w-6 rounded-full'
                        />

                        <span className='body2-extrabold'>옌아</span>
                      </div>

                      <span className='body1-bold'>
                        바우라움 유치원 내돈내산 이용후기 {index + 1}
                      </span>

                      <p className='body2-regular text-text-secondary mb-[15px] line-clamp-2'>
                        바우라움 유치원 내돈내산 이용후기를 가져왔어요 하핫 우리
                        뚜비는 바우라움만 가면 폭식을 한답니다 간식도 같이
                        챙겨줬는데 다
                      </p>

                      <div className='body2-regular text-text-tertiary'>
                        2025.04.5
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 맨 위로 가기 버튼에서 onClick 핸들러 제거 */}
              <button
                onClick={handleScrollToTop}
                className='text-text-tertiary'
              >
                맨 위로 가기
              </button>
            </div>
          )}
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
