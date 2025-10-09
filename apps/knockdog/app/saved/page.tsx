'use client';

import { useMemo, useState } from 'react';

/* 공용: 핑크 배경 + img (로드 실패 시 분홍 유지) */
function PinkImg({ src, className = '' }: { src?: string; className?: string }) {
  return (
    <div className={`overflow-hidden bg-pink-200 ${className}`}>
      {src ? (
        <img
          src={src}
          alt=''
          className='h-full w-full object-cover'
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      ) : null}
    </div>
  );
}

/* ================== 페이지 ================== */
export default function SavedPage() {
  const [tab, setTab] = useState<'fav' | 'history'>('fav');

  // 여기 길이를 0으로 만들면 '관심 유치원 비어있음' 화면이 나옵니다.
  const favorites = useMemo(
    () => [
      {
        id: 1,
        name: '강아지 유치원',
        type: '유치원 · 호텔',
        img: '/dog1.png',
        distance: '10.9km',
        location: '서울 강남구',
        priceLabel: '이용요금',
        price: '30,000부터 ~',
        reviewCount: 128,
        memoDate: '2025.04.16',
      },
      {
        id: 2,
        name: '다독강아지 유치원',
        type: '유치원 · 호텔',
        img: '/dog2.png',
        distance: '10.9km',
        location: '서울 강남구',
        priceLabel: '이용요금',
        price: '30,000부터 ~',
        reviewCount: 128,
        memoDate: '2025.04.16',
      },
      {
        id: 3,
        name: '강아지 유치원',
        type: '유치원 · 호텔',
        img: '/dog1.png',
        distance: '10.9km',
        location: '서울 강남구',
        priceLabel: '이용요금',
        price: '30,000부터 ~',
        reviewCount: 128,
        memoDate: '2025.04.16',
      },
    ],
    []
  );

  // 비교 기록 더미(단일 화면)
  const historyGroups = useMemo(
    () => [
      {
        date: '2025.06.02',
        items: [
          {
            highlight: '바우라움 유치원을 더 선호해요!',
            left: { name: '바우라움 유치원', type: '유치원 · 호텔', img: '/dog1.png' },
            right: { name: '다독강아지 유치원', type: '유치원 · 호텔', img: '/dog2.png' },
          },
          {
            left: { name: '바우라움 유치원', type: '유치원 · 호텔', img: '/dog1.png' },
            right: { name: '다독강아지 유치원', type: '유치원 · 호텔', img: '/dog2.png' },
          },
        ],
      },
      {
        date: '2025.06.01',
        items: [
          {
            left: { name: '바우라움 유치원', type: '유치원 · 호텔', img: '/dog1.png' },
            right: { name: '다독강아지 유치원', type: '유치원 · 호텔', img: '/dog2.png' },
          },
        ],
      },
    ],
    []
  );

  const favCount = favorites.length;

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* 헤더 */}
      <header className='relative flex items-center justify-center border-b border-gray-200 px-4 py-3'>
        <h1 className='text-base font-semibold'>보관함</h1>
        <button className='absolute right-4 p-1' aria-label='검색'>
          <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none'>
            <circle cx='11' cy='11' r='7' stroke='#111' strokeWidth='2' />
            <path d='M20 20L16.65 16.65' stroke='#111' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </header>

      {/* 상단 탭 */}
      <div className='flex border-b border-gray-200'>
        <button
          onClick={() => setTab('fav')}
          className={`flex-1 py-3 text-center text-sm ${
            tab === 'fav' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'
          }`}
        >
          관심 유치원 ({favCount})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`flex-1 py-3 text-center text-sm ${
            tab === 'history' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'
          }`}
        >
          비교 기록
        </button>
      </div>

      {/* 필터 바 */}
      <div className='flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm'>
        <label className='flex items-center gap-2'>
          <span className='inline-block h-2.5 w-2.5 rounded-full bg-orange-500' />
          메모
        </label>
        <button className='flex items-center gap-1'>
          <span>거리기준: 집</span>
          <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none'>
            <path d='M6 9l6 6 6-6' stroke='#888' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </div>

      {/* 스크롤 영역 */}
      <div className='relative flex-1 overflow-y-auto'>
        {tab === 'fav' ? (
          favCount === 0 ? (
            <FavEmpty />
          ) : (
            <FavList items={favorites} />
          )
        ) : (
          <HistoryList groups={historyGroups} />
        )}

        {/* 관심유치원 탭에서만 플로팅 버튼 노출(데이터 있을 때) */}
        {tab === 'fav' && favCount > 0 && (
          <button
            className='fixed bottom-20 right-4 flex items-center gap-2 rounded-full bg-black/85 px-4 py-3 text-xs font-semibold text-white shadow-lg'
            aria-label='비교하기'
          >
            <span className='inline-flex h-5 w-5 items-center justify-center rounded bg-white/15'>▦</span>
            비교하기
          </button>
        )}
      </div>

      {/* 하단 네비 (데모) */}
      <nav className='sticky bottom-0 z-10 border-t border-gray-200 bg-white'>
        <ul className='grid grid-cols-4 text-center text-xs text-gray-600'>
          <li className='py-3'>내 주변</li>
          <li className='py-3 font-semibold text-gray-900'>보관함</li>
          <li className='py-3'>유치원</li>
          <li className='py-3'>마이</li>
        </ul>
      </nav>
    </div>
  );
}

/* ========== 관심 유치원: 빈 상태 ========== */
function FavEmpty() {
  return (
    <div className='flex flex-col items-center px-6 py-12'>
      <div className='mt-8 h-44 w-44 rounded bg-gray-200' />
      <p className='mt-6 text-base font-medium text-gray-900'>아직 저장한 유치원이 없어요!</p>
      <button className='mt-8 h-12 w-full max-w-[360px] rounded-2xl bg-[#FF7A00] text-sm font-semibold text-white'>
        유치원 탐색하기
      </button>
    </div>
  );
}

/* ========== 관심 유치원: 리스트 상태 ========== */
function FavList({ items }: { items: any[] }) {
  return (
    <div className='pb-24'>
      {items.map((value) => (
        <FavRow key={value.id} item={value} />
      ))}
    </div>
  );
}

function FavRow({ item }: { item: any }) {
  return (
    <div className='flex items-start gap-3 border-b border-[#F3F3F7] bg-white px-3 py-3'>
      {/* 썸네일 */}
      <PinkImg src={item.img} className='h-20 w-20 shrink-0 rounded-lg' />

      {/* 정보 */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between'>
          <h3 className='truncate text-base font-bold leading-tight'>{item.name}</h3>
          {/* 북마크 */}
          <button className='shrink-0 p-1 text-gray-600' aria-label='저장됨'>
            <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z' />
            </svg>
          </button>
        </div>

        <p className='mt-0.5 text-sm text-gray-500'>{item.type}</p>

        {/* 리뷰/메모 칩 */}
        <div className='mt-2 flex items-center gap-2'>
          <span className='inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[11px] font-medium text-green-700'>
            <span className='font-bold'>N</span>
            리뷰 {item.reviewCount}개
          </span>
          <span className='inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700'>
            <svg className='h-3.5 w-3.5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M4 3h16v14l-6-3-6 3V3z' />
            </svg>
            {item.memoDate} 메모
          </span>
        </div>

        {/* 하단: 거리/요금 라인 */}
        <div className='mt-2 flex flex-wrap items-center gap-3 text-[13px] text-gray-700'>
          <span className='inline-flex items-center gap-1'>
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z' />
            </svg>
            <span className='font-semibold'>{item.distance}</span>
            <span className='text-gray-500'>{item.location}</span>
          </span>

          <span className='h-3.5 w-px bg-gray-300' aria-hidden />

          <span className='inline-flex items-center gap-1'>
            <span className='text-sm'>₩</span>
            <span className='font-semibold'>{item.priceLabel}</span>
            <span>{item.price}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========== 비교 기록: 단일 화면 ========== */
function HistoryList({
  groups,
}: {
  groups: { date: string; items: { highlight?: string; left: any; right: any }[] }[];
}) {
  return (
    <div className='space-y-8 px-4 py-6'>
      {groups.map((g) => (
        <section key={g.date} className='space-y-3'>
          <h3 className='text-sm font-semibold text-gray-800'>{g.date}</h3>
          {g.items.map((it, i) => (
            <HistoryCard key={g.date + i} {...it} />
          ))}
        </section>
      ))}
    </div>
  );
}

function HistoryCard({
  highlight,
  left,
  right,
}: {
  highlight?: string;
  left: { name: string; type: string; img?: string };
  right: { name: string; type: string; img?: string };
}) {
  return (
    <article className='rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5'>
      {/* 상단 라벨/삭제 */}
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex items-center gap-2 text-sm'>
          {highlight ? (
            <>
              <span className='text-gray-900'>👍 {highlight}</span>
            </>
          ) : (
            <span className='text-gray-400'>비교</span>
          )}
        </div>
        <button className='text-xs text-gray-500' aria-label='삭제'>
          삭제 ×
        </button>
      </div>

      {/* 두 썸네일 행 */}
      <div className='grid grid-cols-2 gap-3'>
        <ThumbCard {...left} />
        <ThumbCard {...right} />
      </div>
    </article>
  );
}

function ThumbCard({ name, type, img }: { name: string; type: string; img?: string }) {
  return (
    <div className='rounded-xl border border-gray-200 p-2'>
      <div className='relative'>
        <PinkImg src={img} className='h-28 w-full rounded-lg' />
        <button
          className='absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white'
          aria-label='삭제'
        >
          ×
        </button>
      </div>
      <p className='mt-2 truncate text-sm font-semibold'>{name}</p>
      <p className='truncate text-xs text-gray-500'>{type}</p>
    </div>
  );
}
