'use client';

import { useEffect, useMemo, useState } from 'react';
import Layout from '../(main)/layout';
import { Header } from '@widgets/Header';

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

/* =========================
 * 메인 페이지
 * ========================= */
type FavoriteItem = {
  id: number;
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
  const [favorites] = useState<FavoriteItem[]>([]);
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

  const favCount = favorites.length;

  return (
    <Layout>
      <div className='flex min-h-screen flex-col bg-white'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>보관함</Header.Title>
        </Header>

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

        <div className='relative flex-1 overflow-y-auto'>
          {tab === 'fav' ? (
            favCount === 0 ? (
              <FavEmpty />
            ) : (
              <FavList items={favorites} />
            )
          ) : loading ? (
            <div className='p-8 text-center text-gray-500'>불러오는 중...</div>
          ) : (
            <HistoryList groups={historyGroups} onDelete={onDeleteHistory} />
          )}
        </div>
      </div>
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
      className={`fixed bottom-24 left-3 z-50 rounded-full px-4 py-3 text-xs font-semibold shadow-md transition ${busy ? 'bg-gray-300 text-gray-600' : 'bg-black text-white hover:bg-gray-800'}`}
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
    <div className='flex items-start gap-3 border-b border-[#F3F3F7] bg-white px-3 py-3'>
      <PinkImg src={item.img} className='h-20 w-20 shrink-0 rounded-lg' />
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between'>
          <h3 className='truncate text-base font-bold leading-tight'>{item.name}</h3>
          <button className='shrink-0 p-1 text-gray-600' aria-label='저장됨'>
            <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M6 2a2 2 0 0 0-2 2v18l8-4 8 4V4a2 2 0 0 0-2-2H6z' />
            </svg>
          </button>
        </div>
        <p className='mt-0.5 text-sm text-gray-500'>{item.type}</p>
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
