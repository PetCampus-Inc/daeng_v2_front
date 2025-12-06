/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState, PropsWithChildren, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Icon,
  IconButton,
  IconType,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@knockdog/ui';

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
  countTicketAvg: number;
  monthlyHourlyAvg: number;
};
type Pricing = { countHourlyAvg: number; monthlyHourlyAvg: number; products: Product[] };

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
        countHourlyAvg: 3365,
        monthlyHourlyAvg: 0,
        products: [
          {
            productType: 'NIGHT_CARE',
            min: { name: 'Standard-A(1일기준, 1묘)', price: 45000 },
            max: { name: 'Special Room(1일기준, 6묘 이상)', price: 130000 },
            countTicketAvg: 80769,
            monthlyHourlyAvg: 0,
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
        countHourlyAvg: 833,
        monthlyHourlyAvg: 0,
        products: [
          {
            productType: 'NIGHT_CARE',
            min: { name: '호텔', price: 20000 },
            max: { name: '호텔', price: 20000 },
            countTicketAvg: 20000,
            monthlyHourlyAvg: 0,
          },
        ],
      },
      service: ['ALL_BREEDS', 'CAT', 'VALET', 'HOTEL', 'BATH_SERVICE', 'GROOMING', 'PARKING'],
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
function Label({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`text-text-primary body2-semibold mx-auto flex w-fit items-center gap-1 ${className}`}>
      {children}
    </div>
  );
}
// TODO: 아이콘 수정
function Badge({
  children,
  icon = 'AlarmLine',
  caption,
  className = '',
}: PropsWithChildren<{ icon?: IconType; caption?: string; className?: string }>) {
  return (
    <div
      className={`text-text-primary mx-auto flex w-fit items-center justify-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 ${className}`}
    >
      {icon && <Icon icon={icon} className='h-5 w-5' />}
      <span className='label-medium text-sm'>{children}</span>
      {caption && <span className='text-text-tertiary caption1-regular'>{caption}</span>}
    </div>
  );
}
function CircleAvatar({
  size = 80,
  src,
  alt,
  className = '',
}: {
  size?: number;
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Avatar className={`h-[${size}px] w-[${size}px] ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        <Image src='/images/img_default_image.png' alt='default' width={size} height={size} />
      </AvatarFallback>
    </Avatar>
  );
}

/* =========================
 * SWIPE CAROUSEL
 * ========================= */
interface CellData {
  value: string;
  detail?: string;
}

interface RowData {
  label: string;
  left: CellData;
  right: CellData;
}

interface SlideData {
  title: string;
  rows: RowData[];
}

interface SwipeCarouselProps {
  title?: string;
  slides: SlideData[];
}

function SwipeCarousel({ title, slides }: SwipeCarouselProps) {
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
      {title && <h2 className='m-2 text-lg font-bold'>{title}</h2>}
      <div
        className='relative overflow-hidden rounded-lg bg-white select-none'
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* 버튼 */}
        <IconButton
          aria-label='이전'
          icon='ChevronLeft'
          onClick={prev}
          disabled={currentIndex === 0}
          className='text-text-secondary absolute top-2 left-1 z-1 disabled:opacity-40'
        />
        <IconButton
          icon='ChevronRight'
          aria-label='다음'
          onClick={next}
          disabled={currentIndex === count - 1}
          className='text-text-secondary absolute top-2 right-1 z-1 disabled:opacity-40'
        />

        {/* 슬라이드 */}
        <div
          ref={trackRef}
          className='flex w-full touch-pan-y'
          style={{ transform: `translateX(${-currentIndex * 100}%)`, transition: 'transform 250ms ease' }}
        >
          {slides.map((slide, index) => (
            <Slide key={index} title={slide.title} rows={slide.rows} />
          ))}
        </div>

        {/* 인디케이터 */}
        <div className='mt-2 flex justify-center gap-2 p-2'>
          {Array.from({ length: count }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${index === currentIndex ? 'bg-fill-secondary-700' : 'bg-fill-secondary-400'}`}
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
function DetailRow({ label, left, right }: { label: string; left: CellData; right: CellData }) {
  return (
    <div className='grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] odd:bg-gray-50'>
      <div className='flex min-w-0 flex-col items-center justify-center p-4'>
        <div className='font-semibold'>{left.value}</div>
        {left.detail && <div className='mt-0.5 w-full truncate text-center text-sm'>{left.detail}</div>}
      </div>
      <div className='flex items-center justify-center p-1.5'>
        <div className='caption1-regular text-center text-sm font-semibold whitespace-pre-line text-neutral-600'>
          {label}
        </div>
      </div>
      <div className='flex min-w-0 flex-col items-center justify-center p-4'>
        <div className='font-semibold'>{right.value}</div>
        {right.detail && <div className='mt-0.5 w-full truncate text-center text-sm'>{right.detail}</div>}
      </div>
    </div>
  );
}

function RowList({ rows, className }: { rows: RowData[]; className?: string }) {
  return (
    <div className={`min-w-full overflow-hidden rounded-lg bg-white ${className}`}>
      {rows.map((row, i) => (
        <DetailRow key={i} label={row.label} left={row.left} right={row.right} />
      ))}
    </div>
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
      <CircleAvatar src={avatar} alt={name} />
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
 * DETAIL SLIDES
 * ========================= */
interface TableProps {
  title: string;
  rows: RowData[];
}

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
      <Badge>{title}</Badge>
      <CircleAvatar src={avatar} alt={who} className='mt-3' />
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

function Slide({ title, rows }: SlideData) {
  return (
    <div className='min-w-full'>
      <div className='flex items-center justify-center bg-gray-50 px-2 py-3'>
        <span className='text-sm font-semibold text-neutral-700'>{title}</span>
      </div>
      <RowList rows={rows} />
    </div>
  );
}

function Table({ title, rows }: TableProps) {
  return (
    <div className='w-full'>
      {title && <h2 className='m-2 text-lg font-bold'>{title}</h2>}
      <RowList rows={rows} />
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
      <Header withSpacing={false}>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>비교 결과</Header.Title>
      </Header>

      {/* 선택된 두 유치원 */}
      <div className='grid grid-cols-2 divide-x divide-gray-200 border-y border-gray-200 bg-white'>
        <SelectedCell
          name={left?.name ?? '센터 A'}
          type='유치원 · 호텔'
          avatar={s3ToUrl(left?.thumbnailS3Key)}
          className='pr-2'
        />
        <SelectedCell
          name={right?.name ?? '센터 B'}
          type='유치원 · 호텔'
          avatar={s3ToUrl(right?.thumbnailS3Key)}
          className='pl-2'
        />
      </div>

      {loading ? (
        <div className='p-6 text-sm text-gray-500'>비교 데이터를 불러오는 중…</div>
      ) : (
        <Tabs defaultValue='summary' className='flex flex-col overflow-hidden'>
          <TabsList>
            <TabsTrigger value='summary'>요약</TabsTrigger>
            <TabsTrigger value='details'>자세히</TabsTrigger>
          </TabsList>
          <TabsContent value='summary' className='overflow-y-auto'>
            <div className='min-h-full space-y-4 bg-[#0E0F11] px-3 pt-3 pb-8'>
              <section className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
                <Label className='mb-2'>
                  <span>이용 요금</span>
                  <Tooltip className='flex items-center'>
                    <TooltipTrigger />
                    {/* TODO: 툴팁 내용 작성 */}
                    <TooltipContent>...</TooltipContent>
                  </Tooltip>
                </Label>
                <p className='mt-3 text-center text-sm leading-6'>
                  <b className='text-orange-600'>{right?.name ?? '오른쪽 유치원'}</b>이(가)
                  <br />
                  1시간당 <b className='text-orange-600'>약 124,567원</b> 더 저렴해요
                </p>
                <Badge caption='1시간 평균' className='mt-3'>
                  정기권
                </Badge>
                <div className='mt-5 flex flex-col items-center gap-4'>
                  {<CircleAvatar src={s3ToUrl(left?.thumbnailS3Key)} alt={left?.name} />}
                  <p className='text-center text-sm'>
                    <b>{left?.name ?? '왼쪽 유치원'}</b>이
                    <br />
                    <b>약 1,000,000원</b> 더 저렴해요
                    <br />
                    <span className='text-xs text-gray-500'>(1,000,000원 &lt; 2,000,000원)</span>
                  </p>
                  <Badge caption='1회 평균'>횟수권</Badge>
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
                <Label className='mb-2'>거리</Label>
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
          </TabsContent>
          <TabsContent value='details' className='overflow-y-auto'>
            <div className='flex flex-col gap-5 px-4 py-7'>
              <SwipeCarousel
                title='요금 비교'
                slides={[
                  {
                    title: '나이트케어',
                    rows: [
                      {
                        label: '최저가',
                        left: {
                          value: `약 ${getProductMin(left, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`,
                          detail: getProduct(left, 'NIGHT_CARE')?.min?.name,
                        },
                        right: {
                          value: `약 ${getProductMin(right, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`,
                          detail: getProduct(right, 'NIGHT_CARE')?.min?.name,
                        },
                      },
                      {
                        label: '최대가',
                        left: {
                          value: `약 ${getProductMax(left, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`,
                          detail: getProduct(left, 'NIGHT_CARE')?.max?.name,
                        },
                        right: {
                          value: `약 ${getProductMax(right, 'NIGHT_CARE')?.toLocaleString?.() ?? '-'}원`,
                          detail: getProduct(right, 'NIGHT_CARE')?.max?.name,
                        },
                      },
                      {
                        label: '횟수권\n(1h)',
                        left: { value: `${getProduct(left, 'NIGHT_CARE') ? '○' : '×'}` },
                        right: { value: `${getProduct(right, 'NIGHT_CARE') ? '○' : '×'}` },
                      },
                      {
                        label: '정기권\n(1h)',
                        left: { value: `${getProduct(left, 'NIGHT_CARE') ? '○' : '×'}` },
                        right: { value: `${getProduct(right, 'NIGHT_CARE') ? '○' : '×'}` },
                      },
                    ],
                  },
                ]}
              />

              <SwipeCarousel
                title='거리 비교'
                slides={[
                  {
                    title: '집으로부터',
                    rows: [
                      {
                        label: '도보',
                        left: { value: getTransitTime(left, 'HOME', 'WALKING') },
                        right: { value: getTransitTime(right, 'HOME', 'WALKING') },
                      },
                      {
                        label: '차량',
                        left: { value: getTransitTime(left, 'HOME', 'DRIVING') },
                        right: { value: getTransitTime(right, 'HOME', 'DRIVING') },
                      },
                      {
                        label: '거리',
                        left: { value: getDistanceString(left, 'HOME') },
                        right: { value: getDistanceString(right, 'HOME') },
                      },
                    ],
                  },
                ]}
              />

              <Table
                title='운영 시간 비교'
                rows={[
                  {
                    label: '평일',
                    left: { value: left?.operatingSchedule?.weekdayHours ?? '-' },
                    right: { value: right?.operatingSchedule?.weekdayHours ?? '-' },
                  },
                  {
                    label: '주말',
                    left: { value: left?.operatingSchedule?.weekendHours ?? '-' },
                    right: { value: right?.operatingSchedule?.weekendHours ?? '-' },
                  },
                  {
                    label: '휴무',
                    left: { value: getClosedDaysText(left) },
                    right: { value: getClosedDaysText(right) },
                  },
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
