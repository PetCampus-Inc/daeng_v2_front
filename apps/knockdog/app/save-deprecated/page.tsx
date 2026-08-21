'use client';

import { useEffect, useMemo, useState, Suspense, useRef } from 'react';
import Layout from '../(main)/layout';
import { Header } from '@widgets/Header';
import { SafeArea } from '@shared/ui/safe-area';
import { IconButton, Icon } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import Link from 'next/link';

/* =========================
 * 환경 & 공통 유틸
 * ========================= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''; // 예: https://api.knockdog.net
const DEV_LOGIN_ID = Number(process.env.NEXT_PUBLIC_DEV_LOGIN_ID ?? '1'); // 필요시 .env 에서 바꿔줘

// localStorage 에서 토큰을 읽어 Header 구성
const makeAuthHeaders = (): HeadersInit => {
  // 항상 'accept' 헤더는 넣고, 토큰이 있으면 Authorization 추가
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const base: Record<string, string> = { accept: 'application/json;charset=UTF-8' };
  if (token) base['Authorization'] = `Bearer ${token}`;
  return base;
};

/* =========================
 * 타입 (히스토리 API 인터페이스)
 * ========================= */
/* eslint-disable @next/next/no-img-element */

type KindergartenCategory = 'HOTEL' | 'GROOMING' | 'KINDERGARTEN' | 'PET_SHOP';

interface Kindergarten {
  id: string;
  name: string;
  thumbnailS3Key: string;
  categories: KindergartenCategory[];
}

type IsoLikeTuple = ReadonlyArray<number | undefined>;

export interface ComparisonHistory {
  id: number;
  kindergartens: Kindergarten[];
  comparedAt: IsoLikeTuple;
}

/* =========================
 * 북마크 API 타입
 * ========================= */
interface BookmarkTransitTime {
  type: string; // 예: 'WALKING'
  time: string;
}

interface BookmarkDistance {
  referencePoint: string; // 예: 'HOME'
  distance: string;
  transitTimes: BookmarkTransitTime[];
}

interface BookmarkItemDTO {
  id: string;
  name: string;
  thumbnailS3Key: string;
  categories: KindergartenCategory[] | string[];
  location: string;
  price: number;
  reviewCount: number;
  distances: BookmarkDistance[];
}

/* =========================
 * 유틸 함수들 (그대로)
 * ========================= */
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

const s3ToUrl = (key?: string): string | undefined => {
  if (!key) return undefined;
  return `https://cdn.example.com/${encodeURI(key)}`;
};

const pad2 = (val: number) => (val < 10 ? `0${val}` : `${val}`);

const dateFromArray = (arr: IsoLikeTuple): Date => {
  const [y, mo, d, h, mi, s] = arr;
  return new Date(y ?? 1970, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, s ?? 0);
};

const formatYmd = (arr: IsoLikeTuple) => {
  const d = dateFromArray(arr);
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
};

/* 카테고리 → 한글 라벨 */
const getKindergartenTypeLabel = (categories: (KindergartenCategory | string)[] = []): string => {
  const hasKindergarten = categories.includes('KINDERGARTEN');
  const hasHotel = categories.includes('HOTEL');
  if (hasKindergarten && hasHotel) return '유치원 · 호텔';
  if (hasKindergarten) return '유치원';
  if (hasHotel) return '호텔';
  return '유치원';
};

/* =========================
 * 메인 페이지
 * ========================= */
type FavoriteItem = {
  id: string;
  name: string;
  type: string;
  img?: string;
  distance: string;
  location: string;
  priceLabel: string;
  price: string;
  reviewCount: number;
  memoDate: string;
};

export default function SavedPage() {
  const [tab, setTab] = useState<'fav' | 'history'>('fav');

  // 🔍 검색 관련 상태
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [history, setHistory] = useState<ComparisonHistory[]>([]);
  const [loading, setLoading] = useState(false);

  /* =========================
   * API 호출 (비교 히스토리)
   * ========================= */
  useEffect(() => {
    if (tab !== 'history') return;
    const controller = new AbortController();

    const fetchHistory = async () => {
      try {
        setLoading(true);
        // 상대경로 그대로 유지 (/api/v0/...), 헤더는 makeAuthHeaders 사용
        const res = await fetch('/api/v0/kindergarten/comparisons/history?limit=50', {
          method: 'GET',
          headers: makeAuthHeaders(),
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setHistory(json.data ?? []);
      } catch (err) {
        console.error('비교 히스토리 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    return () => controller.abort();
  }, [tab]);

  /* =========================
   * API 호출 (관심 유치원 북마크 리스트)
   * ========================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchBookmarks = async () => {
      try {
        // /api/v0/bookmark 호출, makeAuthHeaders 사용
        const res = await fetch('/api/v0/bookmark', {
          method: 'GET',
          headers: makeAuthHeaders(),
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { data?: BookmarkItemDTO[] } = await res.json();

        const mapped: FavoriteItem[] =
          json.data?.map((item) => {
            const homeDistance = item.distances?.find((d) => d.referencePoint === 'HOME') ?? item.distances?.[0];

            return {
              id: item.id,
              name: item.name,
              type: getKindergartenTypeLabel(item.categories),
              img: s3ToUrl(item.thumbnailS3Key),
              distance: homeDistance?.distance ?? '',
              location: shortenLocation(item.location),
              priceLabel: '이용요금',
              price: item.price > 0 ? `${item.price.toLocaleString()}부터 ~` : '0원',
              reviewCount: item.reviewCount ?? 0,
              // 백엔드 스펙에 메모 날짜 필드가 없으므로, 일단 비워둠
              memoDate: '',
            };
          }) ?? [];

        setFavorites(mapped);
      } catch (err) {
        console.error('북마크 리스트 불러오기 실패:', err);
      }
    };

    fetchBookmarks();
    return () => controller.abort();
  }, []);

  /* =========================
   * 날짜별 그룹핑
   * ========================= */
  const historyGroups = useMemo(() => {
    const map = new Map<string, ComparisonHistory[]>();
    for (const item of history) {
      const key = formatYmd(item.comparedAt);
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([date, items]) => ({ date, items }));
  }, [history]);

  /* =========================
   * 검색 필터링 (관심 유치원)
   * ========================= */
  const totalFavCount = favorites.length;

  const filteredFavorites = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return favorites;
    return favorites.filter((f) => f.name.includes(q));
  }, [favorites, searchQuery]);

  /* =========================
   * 비교 히스토리 삭제
   * ========================= */
  const onDeleteHistory = async (id: number) => {
    try {
      const res = await fetch(`/api/v0/kindergarten/comparisons/history/${id}`, {
        method: 'DELETE',
        headers: makeAuthHeaders(),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`삭제 실패: ${res.status}`);
      const json = await res.json();
      console.log('삭제 결과:', json);

      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error('삭제 요청 중 오류 발생:', err);
    }
  };

  const favCount = filteredFavorites.length;

  const shortenLocation = (loc?: string): string => {
    if (!loc) return '';
    const parts = loc.trim().split(/\s+/); // 공백 기준으로 자르기
    return parts.slice(0, 2).join(' '); // 앞에서 두 단어만
  };

  /* =========================
   * 검색 핸들러
   * ========================= */
  const handleSubmitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchValue.trim();
    setSearchQuery(q);
    searchInputRef.current?.blur();
  };

  const handleClearSearchInput = () => {
    setSearchValue('');
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleExitSearch = () => {
    setIsSearchMode(false);
    setSearchValue('');
    setSearchQuery('');
  };

  return (
    <Layout>
      <SafeArea edges={['top']} className='flex h-dvh flex-col'>
        <div className='flex min-h-dvh flex-col bg-white'>
          {/* 🔍 상단: 기본 헤더 / 검색 헤더 토글 */}
          {isSearchMode ? (
            <SearchHeader
              searchValue={searchValue}
              onChangeSearch={setSearchValue}
              onSubmit={handleSubmitSearch}
              onClearInput={handleClearSearchInput}
              onExit={handleExitSearch}
              inputRef={searchInputRef}
            />
          ) : (
            <Header>
              <Header.LeftSection>
                <Suspense fallback={null}>
                  <Header.BackButton />
                </Suspense>
              </Header.LeftSection>
              <Header.Title>보관함</Header.Title>
              <Header.RightSection>
                <IconButton
                  icon='Search'
                  onClick={() => {
                    setIsSearchMode(true);
                    setTimeout(() => searchInputRef.current?.focus(), 0);
                  }}
                />
              </Header.RightSection>
            </Header>
          )}

          {/* ▼▼ DEV 로그인 플로팅 버튼 (좌측 고정) ▼▼ */}
          <DevLoginFab />
          {/* ▲▲ DEV 로그인 플로팅 버튼 ▲▲ */}

          {/* 탭 */}
          <div className='flex border-b border-gray-200'>
            <button
              onClick={() => setTab('fav')}
              className={`flex-1 py-3 text-center text-sm ${
                tab === 'fav' ? 'border-b-2 border-orange-500 font-semibold text-orange-500' : 'text-gray-500'
              }`}
            >
              관심 유치원 ({totalFavCount})
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

          <div className='relative flex-1 overflow-y-auto'>
            {tab === 'fav' ? (
              favCount === 0 ? (
                <FavEmpty />
              ) : (
                <FavList items={filteredFavorites} />
              )
            ) : loading ? (
              <div className='p-8 text-center text-gray-500'>불러오는 중...</div>
            ) : (
              <HistoryList groups={historyGroups} onDelete={onDeleteHistory} />
            )}
          </div>
        </div>
      </SafeArea>
    </Layout>
  );
}

/* =========================
 * DEV 로그인 FAB
 * ========================= */
function DevLoginFab() {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<boolean | null>(null);

  const runDevLogin = async () => {
    if (!API_BASE) {
      alert('API_BASE가 비어 있습니다. NEXT_PUBLIC_API_BASE_URL를 설정하세요.');
      return;
    }
    try {
      setBusy(true);
      setOk(null);

      // 스펙: GET /api/v0/auth/dev/{id}
      const res = await fetch(`${API_BASE}/api/v0/auth/dev/${DEV_LOGIN_ID}`, {
        method: 'GET',
        headers: { accept: 'application/json;charset=UTF-8' },
        credentials: 'include',
        cache: 'no-store',
      });

      // 토큰은 응답 헤더의 authorization 에 담겨 옴 (예: "Bearer xxxxx")
      const authHeader = res.headers.get('authorization') || res.headers.get('Authorization');
      if (!authHeader) throw new Error('응답 헤더에 authorization이 없습니다.');
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!token) throw new Error('토큰 파싱 실패');

      localStorage.setItem('accessToken', token);
      setOk(true);
      // 필요시 토스트 교체
      alert('DEV 로그인 완료! 토큰이 저장됐어요.');
    } catch (e) {
      console.error(e);
      setOk(false);
      alert('DEV 로그인 실패');
    } finally {
      setBusy(false);
      // 히스토리 탭이 열려 있었다면, 사용자가 새로고침하거나 다시 탭 전환하면 최신 토큰으로 재요청됩니다.
    }
  };

  return (
    <button
      type='button'
      onClick={runDevLogin}
      disabled={busy}
      aria-label='DEV 로그인'
      title='DEV 로그인 (토큰 저장)'
      className={`fixed bottom-24 left-3 z-50 rounded-full px-4 py-3 text-xs font-semibold shadow-md transition ${
        busy ? 'bg-gray-300 text-gray-600' : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {busy ? '로그인…' : ok === true ? 'DEV ✓' : ok === false ? 'DEV ✗' : 'DEV'}
    </button>
  );
}

/* =========================
 * 관심 유치원 (그대로)
 * ========================= */
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

function FavList({ items }: { items: FavoriteItem[] }) {
  return (
    <div className='pb-24'>
      {items.map((item) => (
        <FavRow key={item.id} item={item} />
      ))}
    </div>
  );
}
function FavRow({ item }: { item: FavoriteItem }) {
  return (
    <div className='flex items-start gap-3 border-b border-[#F3F3F7] bg-white px-4 py-3'>
      <PinkImg src={item.img} className='h-[72px] w-[72px] shrink-0 rounded-lg' />

      <div className='min-w-0 flex-1'>
        {/* 상단: 이름 + 북마크 아이콘 */}
        <div className='flex items-start justify-between'>
          <div className='min-w-0'>
            <h3 className='truncate text-[15px] leading-tight font-bold text-gray-900'>{item.name}</h3>
            <p className='mt-[2px] text-xs text-gray-500'>{item.type}</p>
          </div>

          <button className='shrink-0 p-1 text-gray-600' aria-label='저장됨'>
            <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z' />
            </svg>
          </button>
        </div>

        {/* 중간: 배지들 (N 리뷰 / 메모) */}
        <div className='mt-2 flex flex-wrap items-center gap-2 text-[11px]'>
          {/* N 리뷰 배지 */}
          <div className='inline-flex items-center rounded-md bg-[#E6F4EC] px-1.5 py-0.5'>
            <span className='mr-[4px] rounded-[3px] bg-[#03C75A] px-[4px] text-[10px] leading-none font-extrabold text-white'>
              N
            </span>
            <span className='text-[11px] text-gray-800'>리뷰 {item.reviewCount}개</span>
          </div>

          {/* 메모 배지 (있을 때만) */}
          {item.memoDate && (
            <div className='inline-flex items-center rounded-md bg-[#F5F5F7] px-1.5 py-0.5 text-[11px] text-gray-700'>
              <svg
                className='mr-1 h-3 w-3 text-gray-500'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='1.8'
              >
                <rect x='4' y='4' width='16' height='14' rx='2' ry='2' />
                <line x1='7' y1='9' x2='17' y2='9' />
                <line x1='7' y1='13' x2='13' y2='13' />
              </svg>
              <span>{item.memoDate} 메모</span>
            </div>
          )}
        </div>

        {/* 하단: 거리 / 위치 / 이용요금 */}
        <div className='mt-2 flex flex-wrap items-center text-sm leading-5 text-[#15161B]'>
          {/* 위치 아이콘 + 거리 (Body2 / ExtraBold) */}
          {item.distance && (
            <>
              <span className='mr-1 flex items-center text-[#15161B]'>
                <Icon icon='LocationFill' className='h-5 w-5' />
              </span>
              <span className='truncate font-extrabold'>{item.distance}</span>
            </>
          )}

          {/* 주소 (Body2 / Regular) */}
          {item.location && <span className='ml-1 truncate font-normal'>{item.location}</span>}

          {/* 구분선 */}
          {item.price && (
            <>
              <span className='mx-1 text-gray-300'>|</span>

              {/* 이용요금 아이콘 */}
              <span className='mr-1 flex items-center text-[#15161B]'>
                <Icon icon='Won' className='h-5 w-5' />
              </span>

              {/* "이용요금" (Body2 / ExtraBold) */}
              <span className='truncate font-extrabold'>{item.priceLabel}</span>

              {/* 가격 + "부터~" (Body2 / Regular) */}
              <span className='ml-1 truncate font-normal'>{item.price}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
 * 비교 히스토리 (그대로)
 * ========================= */
function HistoryList({
  groups,
  onDelete,
}: {
  groups: { date: string; items: ComparisonHistory[] }[];
  onDelete: (id: number) => void;
}) {
  return (
    <div className='space-y-8 px-4 py-6'>
      {groups.map((g) => (
        <section key={g.date} className='space-y-3'>
          <h3 className='text-sm font-semibold text-gray-800'>{g.date}</h3>
          {g.items.map((it) => (
            <HistoryCard key={it.id} history={it} onDelete={() => onDelete(it.id)} />
          ))}
        </section>
      ))}
    </div>
  );
}

function HistoryCard({ history, onDelete }: { history: ComparisonHistory; onDelete?: (id: number) => void }) {
  const left = history.kindergartens[0];
  const right = history.kindergartens[1];
  if (!left || !right) return null;

  return (
    <article className='rounded-2xl bg-white p-3 shadow-sm ring-1 ring-black/5'>
      <div className='mb-2 flex items-center justify-between'>
        <div className='text-sm text-gray-400'>비교</div>
        <button className='text-xs text-gray-500' onClick={() => onDelete?.(history.id)} aria-label='삭제'>
          삭제 ×
        </button>
      </div>

      <div className='mb-2 text-xs text-gray-500'>{formatYmd(history.comparedAt)}</div>

      <div className='grid grid-cols-2 gap-3'>
        <ThumbCard
          name={left.name}
          type={left.categories.includes('KINDERGARTEN') ? '유치원' : '유치원 · 호텔'}
          img={s3ToUrl(left.thumbnailS3Key)}
        />
        <ThumbCard
          name={right.name}
          type={right.categories.includes('KINDERGARTEN') ? '유치원' : '유치원 · 호텔'}
          img={s3ToUrl(right.thumbnailS3Key)}
        />
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
          className='absolute top-1 right-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white'
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

/* =========================
 * 검색 헤더 컴포넌트
 * ========================= */
type SearchHeaderProps = {
  searchValue: string;
  onChangeSearch: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClearInput: () => void;
  onExit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

function SearchHeader({ searchValue, onChangeSearch, onSubmit, onClearInput, onExit, inputRef }: SearchHeaderProps) {
  const hasValue = searchValue.trim().length > 0;

  return (
    <div className='flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2'>
      {/* 검색바 자체 */}
      <form onSubmit={onSubmit} className='flex-1'>
        <div className='flex h-10 items-center rounded-md bg-[#F5F5F7] px-3'>
          {/* 돋보기 아이콘 */}
          <svg
            className='h-4 w-4 flex-shrink-0 text-gray-400'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <circle cx='11' cy='11' r='7' />
            <line x1='16.5' y1='16.5' x2='21' y2='21' />
          </svg>

          {/* 입력창 */}
          <input
            ref={inputRef}
            value={searchValue}
            onChange={(e) => onChangeSearch(e.target.value)}
            placeholder='업체 또는 주소를 검색하세요'
            className='ml-2 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400'
          />

          {/* 인풋 안쪽 X 버튼 (값 있을 때만 노출) */}
          {hasValue && (
            <button
              type='button'
              onClick={onClearInput}
              className='ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[10px] text-white'
            >
              ×
            </button>
          )}
        </div>
      </form>

      {/* 우측 큰 X (검색 모드 종료) */}
      <button
        type='button'
        onClick={onExit}
        aria-label='검색 닫기'
        className='flex h-8 w-8 items-center justify-center rounded-full text-gray-600'
      >
        <svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
          <line x1='6' y1='6' x2='18' y2='18' />
          <line x1='6' y1='18' x2='18' y2='6' />
        </svg>
      </button>
    </div>
  );
}
