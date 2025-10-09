'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';

type PinkImgProps = {
  src?: string;
  className?: string; // 크기/둥근모서리 등은 래퍼에 적용
  alt?: string;
  fill?: boolean; // 레이아웃에 따라 쓰기 (기본은 고정 width/height)
  width?: number;
  height?: number;
};

/* =========================
 * Page
 * ========================= */
export default function CompareCompletePage() {
  const [tab, setTab] = useState<'summary' | 'details'>('summary');

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Header */}
      <header className='sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3'>
        <button aria-label='닫기' className='text-xl'>
          ×
        </button>
        <h1 className='text-base font-bold'>비교 결과</h1>
        <button className='text-sm text-gray-700'>공유하기</button>
      </header>

      {/* 선택된 두 유치원 */}
      <div className='grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-100 bg-white'>
        <SelectedCell name='강아지 유치원 A' type='유치원 · 호텔' src='/dog1.png' />
        <SelectedCell name='스타동 강아지…' type='유치원 · 호텔' src='/dog2.png' />
      </div>

      {/* 탭 */}
      <div className='sticky top-[56px] z-10 flex border-b border-gray-200 bg-white'>
        <button
          onClick={() => setTab('summary')}
          className={`flex-1 py-2 text-center text-sm ${
            tab === 'summary' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'
          }`}
        >
          요약
        </button>

        <button
          onClick={() => setTab('details')}
          className={`flex-1 py-2 text-center text-sm ${
            tab === 'details' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'
          }`}
        >
          자세히
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className='mb-14 flex-1 overflow-y-auto'>{tab === 'summary' ? <SummaryTab /> : <DetailsTab />}</div>
    </div>
  );
}

/* =========================
 * Summary Tab (원본 유지)
 * ========================= */
function SelectedCell({ name, type, src }: { name: string; type: string; src?: string }) {
  return (
    <div className='flex min-w-0 items-center gap-3 px-4 py-3'>
      <PinkImg src={src} className='rounded-lg' width={80} height={80} />
      <div className='min-w-0 leading-none'>
        <p className='truncate text-sm font-semibold leading-5'>{name}</p>
        <p className='truncate text-xs leading-4 text-gray-500'>{type}</p>
      </div>
    </div>
  );
}

function SummaryTab() {
  return (
    <div className='min-h-full space-y-4 bg-[#0E0F11] px-3 pb-8 pt-3'>
      <div className='rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5'>
        <Card>
          <Label icon='💳'>이용 요금</Label>

          <p className='mt-3 text-center text-sm leading-6'>
            <b className='text-orange-600'>스타동 강아지유치원&애견호텔&애견미용</b>…이
            <br />
            1시간당 <b className='text-orange-600'>약 124,567원</b> 더 저렴해요
          </p>

          <Pill className='mt-3'>정기권 1시간 평균</Pill>

          <div className='mt-5 flex flex-col items-center gap-4'>
            <CircleAvatar src='/dog1.png' />
            <p className='text-center text-sm'>
              <b>바우라움 유치원</b>이
              <br />
              <b>약 1,000,000원</b> 더 저렴해요
              <br />
              <span className='text-xs text-gray-500'>(1,000,000원 &lt; 2,000,000원)</span>
            </p>
            <Pill>횟수권 1회 평균</Pill>
          </div>
        </Card>

        <Card className='mt-4'>
          <Label icon='🚐'>픽드랍</Label>
          <p className='mt-3 text-center text-sm'>
            <b className='text-orange-600'>스타동 강아지유치원&애견호텔&애견미용</b>…만
            <br />
            픽드랍 서비스를 제공합니다
          </p>
        </Card>

        <Card className='mt-4'>
          <Label icon='📍'>거리</Label>
          <p className='mt-3 text-center text-sm'>
            <span className='text-gray-600'>집</span> <span>에서</span>{' '}
            <b className='text-orange-600'>바우라움 유치원</b>
            이
            <br />
            <b>도보</b>로 가장 가까워요
          </p>

          <div className='mt-5 space-y-6'>
            <SummaryDistanceRow
              icon='🚗'
              title='자동차'
              who='스타동 강아지…'
              diff='N분 더 가까워요'
              avg='(100분 &lt; 200분)'
            />
            <SummaryDistanceRow
              icon='🚌'
              title='대중교통'
              who='스타동 강아지…'
              diff='N분 더 가까워요'
              avg='(100분 &lt; 200분)'
            />
          </div>
        </Card>

        <Card className='mt-4'>
          <Label icon='🕒'>영업일</Label>

          <div className='mt-5 space-y-8'>
            <SummaryDays
              name='바우라움 유치원'
              avatar='/dog1.png'
              days={{ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false }}
            />
            <SummaryDays
              name='스타동 강아지유치원&애견호텔&애견미용'
              avatar='/dog2.png'
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
        </Card>
      </div>
    </div>
  );
}

function SummaryDistanceRow({
  icon,
  title,
  who,
  diff,
  avg,
}: {
  icon: string;
  title: string;
  who: string;
  diff: string;
  avg: string;
}) {
  return (
    <div className='flex flex-col items-center'>
      <Pill>{title}</Pill>
      <CircleAvatar src='/dog2.png' className='mt-3' />
      <p className='mt-2 text-center text-sm'>
        <b>{who}</b>…이
        <br />
        {diff}
        <br />
        <span className='text-xs text-gray-500'>{avg}</span>
      </p>
    </div>
  );
}

type DaysFlags = Partial<Record<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun', boolean>>;

function SummaryDays({
  name,
  avatar,
  days,
  className = '',
}: {
  name: string;
  avatar?: string;
  days: DaysFlags;
  className?: string;
}) {
  const DAY_ORDER: Array<{ key: keyof DaysFlags; label: string }> = [
    { key: 'mon', label: '월' },
    { key: 'tue', label: '화' },
    { key: 'wed', label: '수' },
    { key: 'thu', label: '목' },
    { key: 'fri', label: '금' },
    { key: 'sat', label: '토' },
    { key: 'sun', label: '일' },
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <PinkImg src={avatar} className='h-14 w-14 rounded-full' />
      <p className='mt-2 text-sm font-semibold'>{name}</p>
      <div className='mt-3 flex gap-1'>
        {DAY_ORDER.map(({ key, label }) => {
          const on = !!days?.[key];
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
 * Details Tab with Swipe Carousels
 * ========================= */
function DetailsTab() {
  return (
    <div className='space-y-10 px-4 py-6'>
      {/* 요금 비교 (스와이프) */}
      <section>
        <h2 className='mb-3 text-base font-bold'>요금 비교</h2>

        <SwipeCarousel
          slides={[
            <FeeSlide
              key='데이케어'
              title='데이케어'
              leftUp='약 30,000원'
              rightUp='약 25,000원'
              leftDown='약 230,000원'
              rightDown='약 250,000원'
              hasCountPass={true}
              hasSubPass={true}
            />,
            <FeeSlide
              key='나이트케어'
              title='나이트케어'
              leftUp='약 30,000원'
              rightUp='약 25,000원'
              leftDown='약 230,000원'
              rightDown='약 250,000원'
              hasCountPass={false}
              hasSubPass={true}
              altRow='약 13,245원'
            />,
            <FeeSlide
              key='훈련'
              title='훈련'
              leftUp='약 30,000원'
              rightUp='약 25,000원'
              leftDown='약 230,000원'
              rightDown='약 250,000원'
              hasCountPass={true}
              hasSubPass={true}
              altRow='약 13,245원'
            />,
            <FeeSlide
              key='멤버십'
              title='멤버십'
              leftUp='약 30,000원'
              rightUp='약 25,000원'
              leftDown='약 230,000원'
              rightDown='약 250,000원'
              hasCountPass={false}
              hasSubPass={false}
            />,
          ]}
        />
      </section>

      {/* 강아지 서비스 비교 (그대로) */}
      <section>
        <h2 className='mb-3 text-base font-bold'>강아지 서비스 비교</h2>
        <div className='overflow-hidden rounded-lg border border-gray-200'>
          <div className='bg-gray-50 px-3 py-2 text-sm'>단독 제공</div>
          <div className='grid grid-cols-2 gap-x-6 gap-y-3 p-4 text-center text-sm'>
            <ServiceItem>재활</ServiceItem>
            <ServiceItem>미용</ServiceItem>
            <ServiceItem>루프탑</ServiceItem>
            <ServiceItem>마당</ServiceItem>
          </div>

          <div className='bg-gray-50 px-3 py-2 text-sm'>공통</div>
          <div className='grid grid-cols-4 gap-4 p-4 text-center text-sm'>
            {[
              '소형견 전용',
              '데이케어',
              '분반 돌봄',
              '목욕',
              '산책',
              '훈련',
              '미끄럼방지',
              'CCTV',
              '놀이터',
              '테라스',
            ].map((option) => (
              <ServiceItem key={option}>{option}</ServiceItem>
            ))}
          </div>

          <div className='bg-gray-50 px-3 py-2 text-sm'>미제공</div>
          <div className='grid grid-cols-1 gap-3 p-4 text-center text-sm'>
            <ServiceItem>운동장</ServiceItem>
          </div>
        </div>
      </section>

      {/* 거리 비교 (스와이프) */}
      <section>
        <h2 className='mb-3 text-base font-bold'>거리 비교</h2>

        <SwipeCarousel
          slides={[
            <DistanceSlide
              key='집'
              title='집으로부터'
              rows={[
                { label: '도보', left: '5분', right: '7분' },
                { label: '대중교통', left: '12분', right: '15분' },
                { label: '차량', left: '5분', right: '7분' },
                { label: '거리', left: '1.2km', right: '1.5km' },
              ]}
            />,
            <DistanceSlide
              key='회사'
              title='회사로부터'
              rows={[
                { label: '도보', left: '–', right: '7분' },
                { label: '대중교통', left: '12분', right: '–' },
                { label: '차량', left: '5분', right: '7분' },
                { label: '거리', left: '1.2km', right: '1.5km' },
              ]}
            />,
            <DistanceSlide
              key='기타'
              title='〈기타 장소〉로부터'
              rows={[
                { label: '도보', left: '5분', right: '7분' },
                { label: '대중교통', left: '–', right: '15분' },
                { label: '차량', left: '5분', right: '7분' },
                { label: '거리', left: '–', right: '1.5km' },
              ]}
            />,
          ]}
        />
      </section>

      {/* 운영 시간 비교 (그대로) */}
      <section>
        <h2 className='mb-3 text-base font-bold'>운영 시간 비교</h2>
        <div className='grid grid-cols-2 gap-3'>
          <DetailRow label='평일' left='10:00~19:00' right='09:00~18:00' />
          <DetailRow label='주말' left='-' right='09:00~18:00' />
          <DetailRow label='휴무' left='주말, 공휴일' right='일요일, 공휴일' />
        </div>
      </section>
    </div>
  );
}

/* =========================
 * Reusable Swipe Carousel
 * ========================= */
function SwipeCarousel({ slides }: { slides: React.ReactNode[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  // 포인터/터치 스와이프
  const startX = useRef(0);
  const deltaX = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i));
  const go = (i: number) => setIndex(clamp(i));
  const prev = () => go(index - 1);
  const next = () => go(index + 1);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    deltaX.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    deltaX.current = e.clientX - startX.current;
    if (containerRef.current) {
      const pct = -index * 100 + (deltaX.current / containerRef.current.clientWidth) * 100;
      containerRef.current.style.transform = `translateX(${pct}%)`;
      containerRef.current.style.transition = 'none';
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const width = containerRef.current?.clientWidth ?? 1;
    const distance = deltaX.current;
    const velocity = (e.clientX - startX.current) / (e.timeStamp || 1); // px/ms
    const travelRatio = Math.abs(distance) / width;

    const shouldSlide = travelRatio > 0.2 || Math.abs(velocity) > 0.5;

    let target = index;
    if (shouldSlide) target = distance < 0 ? index + 1 : index - 1;

    target = clamp(target);
    setIndex(target);

    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 250ms ease';
      containerRef.current.style.transform = `translateX(${-target * 100}%)`;
    }
  };

  const wrapperStyle = useMemo(
    () => ({
      transform: `translateX(${-index * 100}%)`,
    }),
    [index]
  );

  return (
    <div className='w-full'>
      <div
        className='relative select-none overflow-hidden rounded-lg border border-gray-200 bg-white'
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* 슬라이드 트랙 */}
        <div
          ref={containerRef}
          className='flex w-full touch-pan-y'
          style={{ ...wrapperStyle, transition: 'transform 250ms ease' }}
        >
          {slides.map((node, i) => (
            <div key={i} className='w-full shrink-0'>
              {node}
            </div>
          ))}
        </div>

        {/* 좌우 화살표 */}
        <button
          type='button'
          aria-label='이전'
          onClick={prev}
          disabled={index === 0}
          className='absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-lg shadow disabled:opacity-40'
        >
          ‹
        </button>
        <button
          type='button'
          aria-label='다음'
          onClick={next}
          disabled={index === count - 1}
          className='absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-lg shadow disabled:opacity-40'
        >
          ›
        </button>

        {/* ✅ 페이지 점: 캐러셀 공통에서만 렌더 */}
        <div className='pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1'>
          {Array.from({ length: count }).map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-gray-600' : 'bg-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================
 * Slides
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
  hasCountPass: boolean; // 횟수권 ○/×
  hasSubPass: boolean; // 정기권 ○/×
  altRow?: string; // 하단 강조 가격 (옵션)
}) {
  return (
    <div className='p-3 pb-6'>
      {/* pb로 캐러셀 점과 간격 확보 */}
      {/* 카테고리 라벨 */}
      <div className='mb-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2'>
        <span className='px-2 py-1 opacity-0'>‹</span>
        <span className='text-sm text-gray-700'>{title}</span>
        <span className='px-2 py-1 opacity-0'>›</span>
      </div>

      {/* 가격 2열 */}
      <div className='grid grid-cols-2 gap-3'>
        <DetailMoney title={leftUp} subtitle='상품명' />
        <DetailMoney title={rightUp} subtitle='상품명' />
        <DetailMoney title={leftDown} subtitle='상품명' />
        <DetailMoney title={rightDown} subtitle='상품명' />
        <DetailYesNo label='횟수권 (1h)' left={hasCountPass ? '○' : '–'} right={hasCountPass ? '○' : '×'} />
        <DetailYesNo label='정기권 (1h)' left={hasSubPass ? '○' : '–'} right={hasSubPass ? '○' : '×'} />
      </div>

      {altRow ? (
        <div className='mt-4 flex items-center justify-center'>
          <span className='rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-800'>{altRow}</span>
        </div>
      ) : null}
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
      {/* pb로 캐러셀 점과 간격 확보 */}
      <div className='rounded-lg bg-gray-50 px-3 py-2 text-center text-sm text-gray-600'>{title}</div>
      <div className='mt-3 grid grid-cols-2 gap-3'>
        {rows.map((value) => (
          <DetailRow key={value.label} label={value.label} left={value.left} right={value.right} />
        ))}
      </div>
    </div>
  );
}

/* =========================
 * Tiny Atoms
 * ========================= */
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`${className}`}>{children}</section>;
}

function Label({
  children,
  icon,
  className = '',
  center = true,
}: {
  children: React.ReactNode;
  icon?: string;
  className?: string;
  center?: boolean;
}) {
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
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
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

function DetailMoney({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className='rounded-lg bg-gray-50 p-3 text-center'>
      <div className='text-sm font-semibold'>{title}</div>
      <div className='mt-1 text-xs text-gray-500'>{subtitle}</div>
    </div>
  );
}

function DetailYesNo({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <>
      <div className='rounded-lg bg-gray-50 p-3 text-center'>
        <div className='text-sm'>{left}</div>
        <div className='mt-1 text-xs text-gray-500'>{label}</div>
      </div>
      <div className='rounded-lg bg-gray-50 p-3 text-center'>
        <div className='text-sm'>{right}</div>
        <div className='mt-1 text-xs text-gray-500'>{label}</div>
      </div>
    </>
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

function ServiceItem({ children }: { children: React.ReactNode }) {
  return <div className='rounded-md border border-gray-200 px-3 py-2'>{children}</div>;
}

export function PinkImg({ src, className = '', alt = '', fill = false, width, height }: PinkImgProps) {
  const [broken, setBroken] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-pink-200 ${className}`}>
      {/* 이미지 로드 실패하거나 src 없으면 분홍 배경만 보임 */}
      {src && !broken && (
        <Image
          src={src}
          alt={alt}
          // 1) 고정 크기일 땐 width/height
          // 2) 부모를 position:relative로 하고 꽉 채우려면 fill
          {...(fill ? { fill: true } : { width: width ?? 80, height: height ?? 80 })}
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-cover'
          onError={() => setBroken(true)}
          // 원격 이미지면 next.config.js에 domains 등록 필요
          // unoptimized 옵션도 가능(외부 CDN 그대로 사용)
        />
      )}
    </div>
  );
}
