import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { TextHighlights } from '@shared/ui/text-highlights';
import type { AddressSearchResult } from '@entities/address';
import { useDebounced, useInfiniteObserver } from '@shared/lib';

const PAGE_SIZE = 30;

interface AddressSearchBoxProps {
  onSelect?: (address: AddressSearchResult['results']['juso'][0]) => void;
}

export default function AddressSearchBox({ onSelect }: AddressSearchBoxProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 500);

  const [results, setResults] = useState<AddressSearchResult['results']['juso']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const triStateHasMore = useMemo(() => results.length < totalCount, [results.length, totalCount]);

  const fetchPage = useCallback(async (keyword: string, page: number, append: boolean) => {
    if (!keyword.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasMore(true);
      setCurrentPage(1);
      return;
    }
    // 중복/경합 가드
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        keyword,
        currentPage: String(page),
        countPerPage: String(PAGE_SIZE),
        resultType: 'json',
        hstryYn: 'N',
        firstSort: 'none',
        addInfoYn: 'N',
      });

      const res = await fetch(`/api/address/search?${params}`, {
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || '주소 검색에 실패했습니다.');
      }

      const data: AddressSearchResult = await res.json();
      const fetched = data.results.juso ?? [];
      const total = parseInt(data.results.common.totalCount || '0', 10);

      if (append) {
        setResults((prev) => {
          const merged = prev.concat(fetched);
          setHasMore(merged.length < total);
          return merged;
        });
      } else {
        setResults(fetched);
        setHasMore(fetched.length < total);
      }

      setTotalCount(total);
      setCurrentPage(page);
    } catch (e) {
      if ((e as any)?.name !== 'AbortError') {
        setError(e instanceof Error ? e.message : '주소 검색에 실패했습니다.');
        if (!append) setResults([]);
      }
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  /** 검색어 변화 → 1페이지부터 새로 로딩 */
  useEffect(() => {
    fetchPage(debouncedSearch, 1, false);
  }, [debouncedSearch, fetchPage]);

  /** 무한 스크롤(hit 시 다음 페이지) */
  useInfiniteObserver({
    root: scrollRef,
    target: sentinelRef,
    disabled: isLoading || !hasMore || !debouncedSearch.trim(),
    onHit: () => {
      const next = currentPage + 1;
      const maxPage = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      if (next <= maxPage) {
        fetchPage(debouncedSearch, next, true);
      } else {
        setHasMore(false);
      }
    },
  });

  const formatAddress = (item: AddressSearchResult['results']['juso'][0]) => {
    const main = item.roadAddr || item.jibunAddr || '주소 정보 없음';
    const sub = item.roadAddr
      ? item.jibunAddr || `${item.siNm} ${item.sggNm} ${item.emdNm}`
      : `${item.siNm} ${item.sggNm} ${item.emdNm}`;
    return { main, sub };
  };

  return (
    <div>
      {/* 상단 검색 */}
      <div className='sticky top-0 z-10 bg-white px-4 pb-4 pt-2'>
        <TextField variant='secondary' prefix={<Icon icon='Search' className='h-5 w-5' />}>
          <TextFieldInput
            placeholder='시/군/구 혹은 도로명 검색'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </TextField>
      </div>

      <div ref={scrollRef} className='max-h-[calc(100vh-134px)] overflow-y-auto px-4'>
        {search === '' && results.length === 0 && (
          <div className='mt-5 px-4'>
            <ul className='text-text-tertiary body2-regular list-disc space-y-2'>
              <li>
                시/군/구 + 도로명, 동명 또는 건물명 <br />
                <span>예) 동해시 중앙로, 여수 중앙동, 대전 현대아파트</span>
              </li>
              <li>도로명 + 건물번호 예) 종로 6</li>
              <li>읍/면/동/리 + 지번 예) 서린동 154-1</li>
            </ul>
          </div>
        )}

        {/* 결과 목록 */}
        {results.length > 0 && (
          <ul>
            {results.map((item, idx) => {
              const { main, sub } = formatAddress(item);
              return (
                <li
                  key={`${item.bdMgtSn ?? idx}-${idx}`}
                  className='cursor-pointer border-b border-neutral-100 py-4 last:border-b-0'
                  onClick={onSelect ? () => onSelect(item) : undefined}
                >
                  <div className='body2-semibold'>{TextHighlights(main, search)}</div>
                  <span className='body2-regular text-text-tertiary'>{TextHighlights(sub, search)}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* 빈 상태 */}
        {debouncedSearch !== '' && !isLoading && !error && results.length === 0 && (
          <div className='flex min-h-[300px] flex-col items-center justify-center px-4 text-center'>
            <span className='h3-semibold text-primitive-neutral-900'>검색 결과가 없어요</span>
            <span className='body2-regular text-primitive-neutral-600 mt-1'>검색어를 확인해주세요</span>
          </div>
        )}

        {/* 센티넬 */}
        {triStateHasMore && <div ref={sentinelRef} className='h-4 w-full' />}
      </div>
    </div>
  );
}
