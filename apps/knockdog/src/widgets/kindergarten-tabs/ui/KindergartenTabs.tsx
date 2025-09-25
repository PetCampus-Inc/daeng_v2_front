'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useRef } from 'react';

import { MemoSection } from './MemoSection';
import { ReviewSection } from './ReviewSection';
import { PricingSection } from './PricingSection';
import { BasicSection } from './BasicSection';
import { Divider } from '@knockdog/ui';
import { KindergartenNearSection } from './KindergartenNearSection';

interface KindergartenTabsProps {
  scrollableDivRef: React.RefObject<HTMLDivElement | null>;
}

function KindergartenTabs({ scrollableDivRef }: KindergartenTabsProps) {
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
          <BasicSection />
          {/* Divider */}
          <Divider size='thick' className='mb-12' />

          {/* 이 근처 다른 유치원은 어때요? */}
          <KindergartenNearSection />
        </>
      </TabsContent>
      <TabsContent value='요금'>
        <PricingSection />
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

export { KindergartenTabs };
