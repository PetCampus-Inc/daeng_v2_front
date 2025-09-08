'use client';

import { Icon, Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useRef } from 'react';
import Link from 'next/link';

import { useParams } from 'next/navigation';
import { RecommendedDogSchoolSection } from '@features/dog-school';
import { DefaultInfoSection, PriceSection } from '@entities/dog-school';
import { MemoSection } from './MemoSection';
import { ReviewSection } from './ReviewSection';
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
        <MemoSection />
      </TabsContent>
    </Tabs>
  );
}
