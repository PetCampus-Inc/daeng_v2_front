'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { ComparisonPanel } from './ComparisonPanel';
import { ComparisonSection } from './ComparisonSection';
import { DistanceSection } from './DistanceSection';
import { DogServiceSection } from './DogServiceSection';
import { HolidaySection } from './HolidaySection';
import { OperatingDaysSection } from './OperatingDaysSection';
import { PickdropSection } from './PickdropSection';
import { PricingSection } from './PricingSection';
import { SwipeCarousel } from './SwipeCarousel';
import { Table } from './Table';
import { createPricingSlides, createDistanceSlides, createOperatingScheduleSlide } from '@features/compare';
import type { KindergartenComparison, ReferencePointType } from '@entities/compare';

interface CompareCompleteTabsProps {
  left: KindergartenComparison;
  right: KindergartenComparison;
  referencePoint: ReferencePointType;
  referencePointOptions: { value: ReferencePointType; label: string }[];
  onReferencePointChange: (value: ReferencePointType) => void;
}

function CompareCompleteTabs({
  left,
  right,
  referencePoint,
  referencePointOptions,
  onReferencePointChange,
}: CompareCompleteTabsProps) {
  const pricingSlidesData = createPricingSlides(left, right);
  const distanceSlidesData = createDistanceSlides(left, right, referencePointOptions);
  const operatingSlideData = createOperatingScheduleSlide(left, right);

  return (
    <Tabs defaultValue='summary' className='flex h-full flex-col'>
      <TabsList>
        <TabsTrigger value='summary'>요약</TabsTrigger>
        <TabsTrigger value='details'>자세히</TabsTrigger>
      </TabsList>

      {/* 요약 탭 */}
      <TabsContent value='summary' className='overflow-y-auto'>
        <div className='bg-text-primary min-h-full space-y-3 px-4 py-7'>
          <ComparisonPanel>
            {/* 이용요금 */}
            <ComparisonSection>
              <PricingSection left={left} right={right} />
            </ComparisonSection>
            {/* 픽드랍 */}
            <ComparisonSection>
              <PickdropSection left={left} right={right} />
            </ComparisonSection>
          </ComparisonPanel>

          <ComparisonPanel>
            {/* 거리 */}
            <ComparisonSection>
              <DistanceSection
                left={left}
                right={right}
                referencePoint={referencePoint}
                referencePointOptions={referencePointOptions}
                onReferencePointChange={onReferencePointChange}
              />
            </ComparisonSection>
          </ComparisonPanel>

          <ComparisonPanel>
            {/* 영업일 */}
            <ComparisonSection>
              <OperatingDaysSection left={left} right={right} />
            </ComparisonSection>
            {/* 공휴일 */}
            <ComparisonSection>
              <HolidaySection left={left} right={right} />
            </ComparisonSection>
          </ComparisonPanel>
        </div>
      </TabsContent>

      {/* 자세히 탭 */}
      <TabsContent value='details' className='flex-1 overflow-y-auto'>
        <div className='flex flex-col gap-5 px-4 py-7'>
          {/* 요금 비교 */}
          <SwipeCarousel title='요금 비교' slides={pricingSlidesData} />
          {/* 거리 비교 */}
          <SwipeCarousel title='거리 비교' slides={distanceSlidesData} />
          {/* 강아지 서비스 비교 */}
          <DogServiceSection leftService={left.service} rightService={right.service} />
          {/* 운영 시간 비교 */}
          <Table title='운영 시간 비교' rows={operatingSlideData} />
        </div>
      </TabsContent>
    </Tabs>
  );
}

export { CompareCompleteTabs };
