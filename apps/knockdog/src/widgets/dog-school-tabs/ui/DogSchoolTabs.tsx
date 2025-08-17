'use client';

import { Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useRef } from 'react';
import Link from 'next/link';

import { useParams } from 'next/navigation';
import { RecommendedDogSchoolSection } from '@features/dog-school';
import { ReviewSection, DefaultInfoSection, PriceSection } from '@entities/dog-school';
import { FreeMemoSection } from '@features/dog-school';

interface DogSchoolTabsProps {
  scrollableDivRef: React.RefObject<HTMLDivElement | null>;
}

export function DogSchoolTabs({ scrollableDivRef }: DogSchoolTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleScrollToDivider = () => {
    if (!tabsRef.current) return;

    const headerHeight = 66;

    const rect = tabsRef.current.getBoundingClientRect();
    const scrollTop = scrollableDivRef.current?.scrollTop ?? 0;
    const targetY = rect.top - headerHeight + scrollTop;

    scrollableDivRef.current?.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
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
        <ReviewSection onScrollTop={handleScrollToDivider} />
      </TabsContent>
      <TabsContent value='메모'>
        <div className='mb-12 mt-8 flex flex-col gap-4 px-4'>
          <FreeMemoSection />
          <div>
            <div className='mb-2 flex justify-between gap-1 py-3'>
              <div className='flex items-center gap-1'>
                <Icon icon='Note' className='text-text-accent h-7 w-7' />
                <span className='h3-extrabold'>상담시 체크리스트</span>
              </div>
              {/* @TODO: 화면 이동 경우 상수 이용할것 */}
              <Link href={`/company/hi/edit-checklist`} className='text-text-tertiary flex items-center gap-1'>
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
  );
}
