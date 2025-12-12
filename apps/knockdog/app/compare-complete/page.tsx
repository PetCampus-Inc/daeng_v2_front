/* eslint-disable @next/next/no-img-element */
'use client';

import { PropsWithChildren, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@knockdog/ui';
import { Header } from '@widgets/Header';
import { SwipeCarousel } from '@widgets/comparisons-tab/ui/SwipeCarousel';
import { Table } from '@widgets/comparisons-tab/ui/Table';
import {
  useComparisonsQuery,
  PricingSection,
  DistanceSection,
  PickdropSection,
  HolidaySection,
  OperatingDaysSection,
  createPricingSlides,
  createDistanceSlides,
  createOperatingScheduleSlide,
} from '@features/compare';
import type { KindergartenComparison } from '@entities/compare';
import { CircleAvatar, serializeCategories, resolveIds, s3ToUrl } from '@entities/compare';
import { SafeArea } from '@shared/ui/safe-area';

// FIXME: 페이지 단에서 useSearchParams를 사용하고 있어서 임시로 Suspense로 감싸서 처리 했습니다. 확인 후 수정 필요합니다
export default function Page() {
  return (
    <SafeArea edges={['top']} className='flex h-dvh flex-col'>
      <Suspense>
        <CompareCompletePage />
      </Suspense>
    </SafeArea>
  );
}
/* =========================
 * SMALL PARTS
 * ========================= */

function SelectedCell({
  name,
  type,
  avatar,
  className,
}: {
  name: string;
  type: string;
  avatar?: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2 px-4 py-5 ${className}`}>
      <CircleAvatar size={40} src={avatar} alt={name} />
      <div className='flex min-w-0 flex-col gap-0.5 leading-none'>
        <p className='h3-extrabold truncate'>{name}</p>
        <p className='text-text-tertiary body2-semibold truncate'>{type}</p>
      </div>
    </div>
  );
}

/* =========================
 * SUMMARY PARTS
 * ========================= */

function ComparisonPanel({ children }: PropsWithChildren) {
  return <div className='bg-fill-secondary-0 rounded-2xl py-10'>{children}</div>;
}

function ComparisonSection({ children }: PropsWithChildren) {
  return <section className='border-line-200 border-b px-4 last:border-b-0'>{children}</section>;
}

/* =========================
 * PAGE
 * ========================= */
function CompareCompletePage() {
  const params = useSearchParams();

  // 🔒 안정화: params 객체 대신 문자열 키를 메모이즈해서 파싱
  const qsKey = params.toString();
  const ids = useMemo(() => resolveIds(new URLSearchParams(qsKey)), [qsKey]);

  const { data, isLoading, error } = useComparisonsQuery(ids);

  const [left, right] = useMemo(() => data?.filter((item): item is KindergartenComparison => !!item) ?? [], [data]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='p-6 text-sm text-gray-500'>비교 데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='p-6 text-sm text-gray-500'>데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  if (!left || !right) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <p className='p-6 text-sm text-gray-500'>비교할 데이터가 올바르지 않습니다.</p>
      </div>
    );
  }

  const pricingSlidesData = createPricingSlides(left, right);
  const distanceSlidesData = createDistanceSlides(left, right);
  const operatingSlideData = createOperatingScheduleSlide(left, right);

  return (
    <div className='flex h-screen flex-col bg-white'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>비교 결과</Header.Title>
      </Header>

      {/* 선택된 두 유치원 */}
      <div className='grid grid-cols-2 divide-x divide-gray-200 border-y border-gray-200 bg-white'>
        {[left, right].map(({ id = '', name = '', categories = [], thumbnailS3Key = '' }, idx) => {
          return (
            <SelectedCell
              key={id}
              name={name}
              type={serializeCategories(categories)}
              avatar={s3ToUrl(thumbnailS3Key)}
              className={idx === 0 ? 'pr-2' : 'pl-2'}
            />
          );
        })}
      </div>

      <Tabs defaultValue='summary' className='flex flex-col overflow-hidden'>
        <TabsList>
          <TabsTrigger value='summary'>요약</TabsTrigger>
          <TabsTrigger value='details'>자세히</TabsTrigger>
        </TabsList>
        <TabsContent value='summary' className='overflow-y-auto'>
          <div className='bg-text-primary min-h-full space-y-3 px-4 py-7'>
            <ComparisonPanel>
              <ComparisonSection>
                <PricingSection left={left} right={right} />
              </ComparisonSection>
              <ComparisonSection>
                <PickdropSection left={left} right={right} />
              </ComparisonSection>
            </ComparisonPanel>

            <ComparisonPanel>
              <ComparisonSection>
                <DistanceSection left={left} right={right} referencePoint={'HOME'} />
              </ComparisonSection>
            </ComparisonPanel>
            <ComparisonPanel>
              <ComparisonSection>
                <OperatingDaysSection left={left} right={right} />
              </ComparisonSection>
              <ComparisonSection>
                <HolidaySection left={left} right={right} />
              </ComparisonSection>
            </ComparisonPanel>
          </div>
        </TabsContent>
        <TabsContent value='details' className='overflow-y-auto'>
          <div className='flex flex-col gap-5 px-4 py-7'>
            <SwipeCarousel title='요금 비교' slides={pricingSlidesData} />

            <SwipeCarousel title='거리 비교' slides={distanceSlidesData} />

            <Table title='운영 시간 비교' rows={operatingSlideData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
