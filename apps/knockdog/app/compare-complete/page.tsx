/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, PropsWithChildren, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@widgets/Header';

/* =========================
 * API & ENDPOINT
 * ========================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const COMPARE_ENDPOINT = `${API_BASE}/api/v0/kindergarten/comparisons`;

/* =========================
 * CONSTANTS / TYPES
 * ========================= */
export const PRODUCT_TYPE = {
  DAYCARE: '데이케어',
  NIGHT_CARE: '나이트케어',
  TRAINING: '훈련',
  MEMBERSHIP: '멤버십',
} as const;
type ProductType = keyof typeof PRODUCT_TYPE;

export const TRANSPORTATION_TYPE = { WALKING: '도보', TRANSIT: '대중교통', DRIVING: '차량' } as const;
type TransportationType = keyof typeof TRANSPORTATION_TYPE;

export const DAY_OF_WEEK = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
  WEEKEND: '주말',
  HOLIDAY: '공휴일',
} as const;
export type DayOfWeek = keyof typeof DAY_OF_WEEK;

type ProductInfo = { name: string; price: number };
type Product = {
  productType: ProductType;
  min: ProductInfo;
  max: ProductInfo;
  passAvg: number;
  subscriptionHourlyAvg: number;
};
type Pricing = { passHourlyAvg: number; subscriptionHourlyAvg: number; products: Product[] };

type TransitTime = { type: TransportationType; time: string };
type Distance = { referencePoint: string; distance: string; transitTimes: TransitTime[] };

type OperatingSchedule = { closedDays: DayOfWeek[]; weekdayHours: string | null; weekendHours: string | null };

export type KindergartenComparison = {
  id: string;
  name: string;
  categories: string[];
  thumbnailS3Key: string;
  pricing: Pricing;
  service: string[];
  distance: Distance[];
  operatingSchedule: OperatingSchedule;
};

type ApiResp = { data: KindergartenComparison[] };

/* =========================
 * FALLBACK MOCK
 * ========================= */
const MOCK: ApiResp = {
  data: [
    {
      id: '13561634',
      name: '모모의고양이호텔',
      thumbnailS3Key: '서울특별시/노원구/13561634/thumbnail.JPG',
      categories: ['HOTEL'],
      pricing: {
        passHourlyAvg: 3365,
        subscriptionHourlyAvg: 0,
        products: [
          {
            productType: 'NIGHT_CARE',
            min: { name: 'Standard-A(1일기준, 1묘)', price: 45000 },
            max: { name: 'Special Room(1일기준, 6묘 이상)', price: 130000 },
            passAvg: 80769,
            subscriptionHourlyAvg: 0,
          },
        ],
      },
      service: ['CAT', 'HOTEL', 'CCTV', 'PRIVATE_ROOM'],
      distance: [
        {
          referencePoint: 'HOME',
          distance: '9.6km',
          transitTimes: [
            { type: 'WALKING', time: '2시간 49분' },
            { type: 'DRIVING', time: '21분' },
          ],
        },
      ],
      operatingSchedule: {
        closedDays: ['MONDAY', 'SATURDAY'],
        weekdayHours: '08:00~20:00',
        weekendHours: '08:00~20:00',
      },
    },
    {
      id: '18662526',
      name: '은평애견',
      thumbnailS3Key: '서울특별시/은평구/18662526/thumbnail.jpg',
      categories: ['HOTEL', 'GROOMING'],
      pricing: {
        passHourlyAvg: 833,
        subscriptionHourlyAvg: 0,
        products: [
          {
            productType: 'NIGHT_CARE',
            min: { name: '호텔', price: 20000 },
            max: { name: '호텔', price: 20000 },
            passAvg: 20000,
            subscriptionHourlyAvg: 0,
          },
        ],
      },
      service: ['DOG_FREE', 'CAT', 'VALET', 'HOTEL', 'BATH_SERVICE', 'GROOMING', 'PARKING'],
      distance: [
        {
          referencePoint: 'HOME',
          distance: '20.9km',
          transitTimes: [
            { type: 'WALKING', time: '5시간 32분' },
            { type: 'DRIVING', time: '29분' },
          ],
        },
      ],
      operatingSchedule: {
        closedDays: ['SATURDAY', 'SUNDAY', 'HOLIDAY'],
        weekdayHours: '00:00~24:00',
        weekendHours: '00:00~24:00',
      },
    },
  ],
};

/* =========================
 * UTILS
 * ========================= */
function resolveIds(searchParams: URLSearchParams): string[] {
  // ids=aaa&ids=bbb
  const repeated = searchParams.getAll('ids').filter(Boolean);
  if (repeated.length >= 2) return repeated;
  // ids=aaa,bbb
  const commaJoined = searchParams.get('ids');
  if (commaJoined) {
    return commaJoined
      .split(',')
      .map((text) => text.trim())
      .filter(Boolean);
  }
  return [];
}

function s3ToUrl(s3Key?: string) {
  if (!s3Key) return undefined;
  const CDN = process.env.NEXT_PUBLIC_CDN_BASE;
  return CDN ? `${CDN}/${encodeURI(s3Key)}` : undefined;
}

type ProdKey = ProductType;

const getProduct = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  kg?.pricing?.products?.find((product) => product?.productType === prodType) ?? null;

const getProductMin = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  getProduct(kg, prodType)?.min?.price ?? null;

const getProductMax = (kg?: KindergartenComparison | null, prodType?: ProdKey | null) =>
  getProduct(kg, prodType)?.max?.price ?? null;

const getTransitTime = (
  kg?: KindergartenComparison | null,
  refPoint: string = 'HOME',
  mode: TransportationType = 'WALKING'
) =>
  kg?.distance
    ?.find((distance) => distance?.referencePoint === refPoint)
    ?.transitTimes?.find((transit) => transit?.type === mode)?.time ?? '-';

const getDistanceString = (kg?: KindergartenComparison | null, refPoint: string = 'HOME') =>
  kg?.distance?.find((distance) => distance?.referencePoint === refPoint)?.distance ?? '-';

const getClosedDaysText = (kg?: KindergartenComparison | null) =>
  (kg?.operatingSchedule?.closedDays ?? []).map((dayKey) => DAY_OF_WEEK[dayKey]).join(', ') || '-';

/* =========================
 * SHARED SMALL UI
 * ========================= */
function PinkImg({
  src,
  className = '',
  alt = '',
  fill = false,
  width,
  height,
}: {
  src?: string;
  className?: string;
  alt?: string;
  fill?: boolean;
  width?: number;
  height?: number;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-pink-200 ${className}`}>
      {src && !broken && (
        <Image
          src={src}
          alt={alt}
          {...(fill ? { fill: true } : { width: width ?? 80, height: height ?? 80 })}
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-cover'
          onError={() => setBroken(true)}
          unoptimized
        />
      )}
    </div>
  );
}
function Label({
  children,
  icon,
  className = '',
  center = true,
}: PropsWithChildren<{ icon?: string; className?: string; center?: boolean }>) {
  return (
    <div
      className={`flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700 ${center ? 'mx-auto w-fit' : ''} ${className}`}
    >
      {icon && <span aria-hidden>{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
function Pill({
  children,
  className = '',
  center = true,
}: PropsWithChildren<{ className?: string; center?: boolean }>) {
  return (
    <span
      className={`flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 ${center ? 'mx-auto w-fit' : ''} ${className}`}
    >
      {children}
    </span>
  );
}
function CircleAvatar({ src, className = '' }: { src?: string; className?: string }) {
  return <PinkImg src={src} className={`h-14 w-14 rounded-full ${className}`} />;
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
function SelectedCell({ name, type, src }: { name: string; type: string; src?: string }) {
  return (
    <div className='flex min-w-0 items-center gap-3 px-4 py-3'>
      <PinkImg src={src} className='h-14 w-14 rounded-lg' />
      <div className='min-w-0 leading-none'>
        <p className='truncate text-sm leading-5 font-semibold'>{name}</p>
        <p className='truncate text-xs leading-4 text-gray-500'>{type}</p>
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
type DaysFlags = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', boolean>>;
function SummaryDays({ name, avatar, days }: { name: string; avatar?: string; days: DaysFlags }) {
  const ORDER: Array<{ key: keyof DaysFlags; label: string }> = [
    { key: 'mon', label: '월' },
    { key: 'tue', label: '화' },
    { key: 'wed', label: '수' },
    { key: 'thu', label: '목' },
    { key: 'fri', label: '금' },
    { key: 'sat', label: '토' },
    { key: 'sun', label: '일' },
  ];
  return (
    <div className='flex flex-col items-center'>
      <PinkImg src={avatar} className='h-14 w-14 rounded-full' />
      <p className='mt-2 text-sm font-semibold'>{name}</p>
      <div className='mt-3 flex gap-1'>
        {ORDER.map(({ key, label }) => {
          const on = !!days[key];
          return (
            <span
              key={key}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${on ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
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
function SummaryDistanceRow({
  title,
  who,
  diff,
  avg,
  avatar,
}: {
  title: string;
  who: string;
  diff: string;
  avg: string;
  avatar?: string;
}) {
  return (
    <div className='flex flex-col items-center'>
      <Pill>{title}</Pill>
      <CircleAvatar src={avatar} className='mt-3' />
      <p className='mt-2 text-center text-sm'>
        <b>{who}</b>이(가)
        <br />
        {diff}
        <br />
        <span className='text-xs text-gray-500'>{avg}</span>
      </p>
    </div>
  );
}

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
export default function CompareCompletePage() {
  const params = useSearchParams();

  // 🔒 안정화: params 객체 대신 문자열 키를 메모이즈해서 파싱
  const qsKey = params.toString();
  const ids = useMemo(() => resolveIds(new URLSearchParams(qsKey)), [qsKey]);
  const idsJoined = useMemo(() => ids.join(','), [ids]);

  const [payload, setPayload] = useState<KindergartenComparison[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      setPayload(MOCK.data); // 최소 UX 보장
      setLoading(false);
      return;
    }

    let ignore = false;
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : undefined;
        const queryString = ids.map((id) => `ids=${encodeURIComponent(id)}`).join('&');
        const url = `${COMPARE_ENDPOINT}?${queryString}`;

        const res = await fetch(url, {
          headers: {
            accept: 'application/json;charset=UTF-8',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
          credentials: 'include',
          signal: ac.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResp = await res.json();
        if (!ignore) setPayload(json.data);
      } catch {
        if (!ignore) setPayload(MOCK.data);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [idsJoined]); // ✅ ids 배열 대신 join된 키만 의존

  const left = payload?.[0] ?? null;
  const right = payload?.[1] ?? null;

  return (
    <div className='flex h-screen flex-col bg-white'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>비교 결과</Header.Title>
      </Header>

      {/* 선택된 두 유치원 */}
      <div className='grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-100 bg-white'>
        <SelectedCell name={left?.name ?? '센터 A'} type='유치원 · 호텔' src={s3ToUrl(left?.thumbnailS3Key)} />
        <SelectedCell name={right?.name ?? '센터 B'} type='유치원 · 호텔' src={s3ToUrl(right?.thumbnailS3Key)} />
      </div>

      {loading ? (
        <div className='p-6 text-sm text-gray-500'>비교 데이터를 불러오는 중…</div>
      ) : (
        <Tabs
          summary={
            <div className='min-h-full space-y-4 bg-[#0E0F11] px-3 pt-3 pb-8'>
              <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
                <Label>이용 요금</Label>
                <p className='mt-3 text-center text-sm leading-6'>
                  <b className='text-orange-600'>{right?.name ?? '오른쪽 유치원'}</b>이(가)
                  <br />
                  1시간당 <b className='text-orange-600'>약 124,567원</b> 더 저렴해요
                </p>
                <Pill className='mt-3'>정기권 1시간 평균</Pill>
                <div className='mt-5 flex flex-col items-center gap-4'>
                  <CircleAvatar src={s3ToUrl(left?.thumbnailS3Key)} />
                  <p className='text-center text-sm'>
                    <b>{left?.name ?? '왼쪽 유치원'}</b>이
                    <br />
                    <b>약 1,000,000원</b> 더 저렴해요
                    <br />
                    <span className='text-xs text-gray-500'>(1,000,000원 &lt; 2,000,000원)</span>
                  </p>
                  <Pill>횟수권 1회 평균</Pill>
                </div>
              </section>

              <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
                <Label>픽드랍</Label>
                <p className='mt-3 text-center text-sm'>
                  <b className='text-orange-600'>{right?.name ?? '오른쪽 유치원'}</b>만
                  <br />
                  픽드랍 서비스를 제공합니다
                </p>
              </section>

              <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
                <Label>거리</Label>
                <p className='mt-3 text-center text-sm'>
                  <span className='text-gray-600'>집</span> 에서 <b className='text-orange-600'>{left?.name ?? ''}</b>이
                  <br />
                  <b>도보</b>로 가장 가까워요
                </p>
                <div className='mt-5 space-y-6'>
                  <SummaryDistanceRow
                    title='자동차'
                    who={right?.name ?? ''}
                    diff='N분 더 가까워요'
                    avg='(100분 &lt; 200분)'
                    avatar={s3ToUrl(right?.thumbnailS3Key)}
                  />
                  <SummaryDistanceRow
                    title='대중교통'
                    who={right?.name ?? ''}
                    diff='N분 더 가까워요'
                    avg='(100분 &lt; 200분)'
                    avatar={s3ToUrl(right?.thumbnailS3Key)}
                  />
                </div>
              </section>

              <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
                <Label>영업일</Label>
                <div className='mt-5 space-y-8'>
                  <SummaryDays
                    name={left?.name ?? ''}
                    avatar={s3ToUrl(left?.thumbnailS3Key)}
                    days={{ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }}
                  />
                  <SummaryDays
                    name={right?.name ?? ''}
                    avatar={s3ToUrl(right?.thumbnailS3Key)}
                    days={{ mon: true, tue: true, wed: true, thu: true, fri: true, sat: true, sun: false }}
                  />
                </div>
                <div className='mt-6 rounded-xl bg-white/80 p-4 text-center'>
                  <p className='text-sm'>
                    <b className='text-orange-600'>두 유치원 모두</b>
                    <br />
                    공휴일에 쉬어요
                  </p>
                </div>
              </section>
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
      )}
    </div>
  );
}
