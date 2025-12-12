'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@knockdog/ui';
import { useRef, useState, useEffect } from 'react';

import { MemoSection } from './MemoSection';
import { ReviewSection } from './ReviewSection';
import { PricingSection } from './PricingSection';
import { BasicSection } from './BasicSection';
import { Divider } from '@knockdog/ui';
import { KindergartenNearSection } from './KindergartenNearSection';
import { useUserStore } from '@entities/user';
import { navigateToLogin } from '@shared/lib/bridge';

interface KindergartenTabsProps {
  scrollableDivRef: React.RefObject<HTMLDivElement | null>;
}

function KindergartenTabs({ scrollableDivRef }: KindergartenTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('기본정보');
  const isLoggedIn = useUserStore((state) => !!state.user);

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

  const handleTabChange = async (value: string) => {
    if (value === '메모' && !isLoggedIn) {
      await navigateToLogin();
      return;
    }
    setActiveTab(value);
  };

  // 로그인하지 않은 상태에서 메모 탭이 활성화되어 있으면 기본정보 탭으로 변경
  useEffect(() => {
    if (activeTab === '메모' && !isLoggedIn) {
      setActiveTab('기본정보');
    }
  }, [activeTab, isLoggedIn]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} ref={tabsRef}>
      <TabsList scrollable className='sticky top-0 z-999 bg-white'>
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
