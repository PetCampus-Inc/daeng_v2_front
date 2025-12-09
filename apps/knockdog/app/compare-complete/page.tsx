/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef, useState, PropsWithChildren, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';
import { CircleAvatar, Label, serializeCategories } from '@entities/compare';
import type { KindergartenComparison, DistanceComparisonsByRef } from '@entities/compare/model/types';
import {
  getClosedDaysText,
  getDistanceString,
  getProduct,
  getProductMax,
  getProductMin,
  getTransitTime,
  resolveIds,
  s3ToUrl,
  extractPrice,
  mapToSimpleItem,
} from '@entities/compare/lib/utils';
import {
  createPriceComparison,
  createDistanceComparisonsByRef,
  PricingSection,
  DistanceSection,
  ComparisonSimpleItem,
  getValetKindergartens,
  getHolidayKindergartens,
  ComparisonDaysItem,
} from '@features/compare';
import { useComparisonsQuery } from '@features/compare/api/useComparisonsQuery';

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
 * SWIPE CAROUSEL
 * ========================= */
function SwipeCarousel({ slides }: { slides: React.ReactNode[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = slides.length;
  const startX = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const clampIndex = (index: number) => Math.max(0, Math.min(count - 1, index));
  const goTo = (index: number) => setCurrentIndex(clampIndex(index));
  const prev = () => goTo(currentIndex - 1);
  const next = () => goTo(currentIndex + 1);

  const handlePointerDown = (event: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = event.clientX;
    deltaX.current = 0;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    deltaX.current = event.clientX - startX.current;
    const percent = -currentIndex * 100 + (deltaX.current / trackRef.current.clientWidth) * 100;
    trackRef.current.style.transform = `translateX(${percent}%)`;
    trackRef.current.style.transition = 'none';
  };
  const handlePointerUp = () => {
    if (!isDragging.current || !trackRef.current) return;
    isDragging.current = false;
    const ratio = Math.abs(deltaX.current) / (trackRef.current.clientWidth || 1);
    let targetIndex = currentIndex;
    if (ratio > 0.2) targetIndex = deltaX.current < 0 ? currentIndex + 1 : currentIndex - 1;
    targetIndex = clampIndex(targetIndex);
    setCurrentIndex(targetIndex);
    trackRef.current.style.transition = 'transform 250ms ease';
    trackRef.current.style.transform = `translateX(${-targetIndex * 100}%)`;
  };

  return (
    <div className='w-full'>
      <div
        className='relative overflow-hidden rounded-lg border border-gray-200 bg-white select-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={trackRef}
          className='flex w-full touch-pan-y'
          style={{ transform: `translateX(${-currentIndex * 100}%)`, transition: 'transform 250ms ease' }}
        >
          {slides.map((node, index) => (
            <div key={index} className='w-full shrink-0'>
              {node}
            </div>
          ))}
        </div>
        <button
          aria-label='이전'
          onClick={prev}
          disabled={currentIndex === 0}
          className='absolute top-2 left-2 rounded-md bg-white/90 px-2 py-1 text-lg shadow disabled:opacity-40'
        >
          ‹
        </button>
        <button
          aria-label='다음'
          onClick={next}
          disabled={currentIndex === count - 1}
          className='absolute top-2 right-2 rounded-md bg-white/90 px-2 py-1 text-lg shadow disabled:opacity-40'
        >
          ›
        </button>
        <div className='pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'>
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full ${index === currentIndex ? 'bg-gray-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
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
function DetailMoney({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className='rounded-lg bg-gray-50 p-3 text-center'>
      <div className='text-sm font-semibold'>{title}</div>
      <div className='mt-1 text-xs text-gray-500'>{subtitle}</div>
    </div>
  );
}
function DetailRow({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <>
      <div className='rounded-lg bg-gray-50 p-3 text-center'>
        <div className='text-base font-medium'>{left}</div>
        <div className='mt-1 text-xs text-gray-500'>{label}</div>
      </div>
      <div className='rounded-lg bg-gray-50 p-3 text-center'>
        <div className='text-base font-medium'>{right}</div>
        <div className='mt-1 text-xs text-gray-500'>{label}</div>
      </div>
    </>
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
 * TABS
 * ========================= */
function Tabs({ summary, details }: { summary: React.ReactNode; details: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  return (
    <>
      <div className='sticky top-[56px] z-10 flex border-b border-gray-200 bg-white'>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 text-center text-sm ${activeTab === 'summary' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'}`}
        >
          요약
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 py-2 text-center text-sm ${activeTab === 'details' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'}`}
        >
          자세히
        </button>
      </div>
      <div className='mb-14 flex-1 overflow-y-auto'>{activeTab === 'summary' ? summary : details}</div>
    </>
  );
}

/* =========================
 * DETAIL SLIDES
 * ========================= */
function FeeSlide({
  title,
  leftUp,
  rightUp,
  leftDown,
  rightDown,
  hasCountPass,
  hasSubPass,
  altRow,
}: {
  title: string;
  leftUp: string;
  rightUp: string;
  leftDown: string;
  rightDown: string;
  hasCountPass: boolean;
  hasSubPass: boolean;
  altRow?: string;
}) {
  return (
    <div className='p-3 pb-6'>
      <div className='mb-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2'>
        <span className='px-2 py-1 opacity-0'>‹</span>
        <span className='text-sm text-gray-700'>{title}</span>
        <span className='px-2 py-1 opacity-0'>›</span>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <DetailMoney title={leftUp} subtitle='상품명' />
        <DetailMoney title={rightUp} subtitle='상품명' />
        <DetailMoney title={leftDown} subtitle='상품명' />
        <DetailMoney title={rightDown} subtitle='상품명' />
        <div className='rounded-lg bg-gray-50 p-3 text-center'>
          <div className='text-sm'>{hasCountPass ? '○' : '–'}</div>
          <div className='mt-1 text-xs text-gray-500'>횟수권 (1h)</div>
        </div>
        <div className='rounded-lg bg-gray-50 p-3 text-center'>
          <div className='text-sm'>{hasCountPass ? '○' : '×'}</div>
          <div className='mt-1 text-xs text-gray-500'>횟수권 (1h)</div>
        </div>
        <div className='rounded-lg bg-gray-50 p-3 text-center'>
          <div className='text-sm'>{hasSubPass ? '○' : '–'}</div>
          <div className='mt-1 text-xs text-gray-500'>정기권 (1h)</div>
        </div>
        <div className='rounded-lg bg-gray-50 p-3 text-center'>
          <div className='text-sm'>{hasSubPass ? '○' : '×'}</div>
          <div className='mt-1 text-xs text-gray-500'>정기권 (1h)</div>
        </div>
      </div>
      {altRow && (
        <div className='mt-4 flex items-center justify-center'>
          <span className='rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800'>{altRow}</span>
        </div>
      )}
    </div>
  );
}

function DistanceSlide({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; left: string; right: string }>;
}) {
  return (
    <div className='p-3 pb-6'>
      <div className='rounded-lg bg-gray-50 px-3 py-2 text-center text-sm text-gray-600'>{title}</div>
      <div className='mt-3 grid grid-cols-2 gap-3'>
        {rows.map((row) => (
          <DetailRow key={row.label} label={row.label} left={row.left} right={row.right} />
        ))}
      </div>
    </div>
  );
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

  // 가격 비교 결과
  const monthlyPricingComparison = createPriceComparison(left, right, extractPrice('monthlyHourlyAvg'));
  const countPricingComparison = createPriceComparison(left, right, extractPrice('countHourlyAvg'));

  // 거리 비교 결과
  const distanceComparisons: DistanceComparisonsByRef = createDistanceComparisonsByRef(left, right);

  const allKindergartens = [left, right].map(mapToSimpleItem);
  const valetKindergartens = getValetKindergartens(left, right);
  const holidayKindergartens = getHolidayKindergartens(left, right);

  return (
    <div className='flex h-screen flex-col bg-white'>
      <Header withSpacing={false}>
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

      <Tabs
        summary={
          <div className='bg-text-primary min-h-full space-y-3 px-4 py-7'>
            <ComparisonPanel>
              <ComparisonSection>
                <PricingSection
                  monthlyPricingComparison={monthlyPricingComparison}
                  countPricingComparison={countPricingComparison}
                />
              </ComparisonSection>
              <ComparisonSection>
                <div className='mt-7 flex flex-col gap-5'>
                  <Label>픽드랍</Label>
                  <ComparisonSimpleItem
                    allKindergartens={allKindergartens}
                    matchedKindergartens={valetKindergartens}
                    trueStatusText='픽드랍 서비스를 제공해요'
                    falseStatusText='픽드랍 서비스가 없어요'
                  />
                </div>
              </ComparisonSection>
            </ComparisonPanel>

            <ComparisonPanel>
              <ComparisonSection>
                <DistanceSection distanceComparisons={distanceComparisons} referencePoint={'HOME'} />
              </ComparisonSection>
            </ComparisonPanel>
            <ComparisonPanel>
              <ComparisonSection>
                <Label>영업일</Label>
                <div className='flex flex-col gap-5 pt-5 pb-7'>
                  <ComparisonDaysItem kindergarten={left} />
                  <ComparisonDaysItem kindergarten={right} />
                </div>
              </ComparisonSection>
              <ComparisonSection>
                <div className='mt-7 flex flex-col gap-5'>
                  <Label>공휴일</Label>
                  <ComparisonSimpleItem
                    allKindergartens={allKindergartens}
                    matchedKindergartens={holidayKindergartens}
                    trueStatusText='공휴일에도 영업해요'
                    falseStatusText='공휴일에 쉬어요'
                  />
                </div>
              </ComparisonSection>
            </ComparisonPanel>
          </div>
        }
        details={
          <div className='space-y-10 px-4 py-6'>
            {/* 요금 비교 */}
            <section>
              <h2 className='mb-3 text-base font-bold'>요금 비교</h2>
              <SwipeCarousel
                slides={[
                  <FeeSlide
                    key='나이트'
                    title='나이트케어'
                    leftUp={`약 ${getProductMin(left, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`}
                    rightUp={`약 ${getProductMin(right, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`}
                    leftDown={`약 ${getProductMax(left, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`}
                    rightDown={`약 ${getProductMax(right, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`}
                    hasCountPass={Boolean(getProduct(left, 'NIGHT_CARE'))}
                    hasSubPass={false}
                  />,
                ]}
              />
            </section>

            {/* 거리 비교 */}
            <section>
              <h2 className='mb-3 text-base font-bold'>거리 비교</h2>
              <SwipeCarousel
                slides={[
                  <DistanceSlide
                    key='집'
                    title='집으로부터'
                    rows={[
                      {
                        label: '도보',
                        left: getTransitTime(left, 'HOME', 'WALKING'),
                        right: getTransitTime(right, 'HOME', 'WALKING'),
                      },
                      {
                        label: '차량',
                        left: getTransitTime(left, 'HOME', 'DRIVING'),
                        right: getTransitTime(right, 'HOME', 'DRIVING'),
                      },
                      {
                        label: '거리',
                        left: getDistanceString(left, 'HOME'),
                        right: getDistanceString(right, 'HOME'),
                      },
                    ]}
                  />,
                ]}
              />
            </section>

            {/* 운영 시간 비교 */}
            <section>
              <h2 className='mb-3 text-base font-bold'>운영 시간 비교</h2>
              <div className='grid grid-cols-2 gap-3'>
                <DetailRow
                  label='평일'
                  left={left?.operatingSchedule?.weekdayHours ?? '-'}
                  right={right?.operatingSchedule?.weekdayHours ?? '-'}
                />
                <DetailRow
                  label='주말'
                  left={left?.operatingSchedule?.weekendHours ?? '-'}
                  right={right?.operatingSchedule?.weekendHours ?? '-'}
                />
                <DetailRow label='휴무' left={getClosedDaysText(left)} right={getClosedDaysText(right)} />
              </div>
            </section>
          </div>
        }
      />
    </div>
  );
}
