'use client';

import { Icon } from '@knockdog/ui';
import { useState } from 'react';

function highlightText(text: string, keyword: string) {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <span key={i} className='text-text-accent'>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function Page() {
  const [search, setSearch] = useState('테헤란로');

  const mockResults: { main: string; sub: string }[] = [
    {
      main: '서울특별시 강남구 테헤란로 지하 156 (역삼동, 역삼역)',
      sub: '서울특별시 강남구 역삼동 804 (역삼역)',
    },
    {
      main: '서울특별시 강남구 테헤란로 212 (삼성동, 한국빌딩)',
      sub: '서울특별시 강남구 삼성동 123 (한국빌딩)',
    },
    {
      main: '서울특별시 강남구 봉은사로 123 (삼성동)',
      sub: '서울특별시 강남구 삼성동 321',
    },
  ];

  return (
    <>
      <div className='mt-[65px] h-[calc(100vh-155px)] overflow-y-auto pb-6'>
        <div className='px-4'>
          <div className='bg-primitive-neutral-50 my-2 flex items-center gap-2 rounded-lg px-4 py-3'>
            <Icon icon='Search' className='h-5 w-5' />
            <input
              placeholder='시/군/구 혹은 도로명 검색'
              className=''
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 아무 입력도 없을 때 */}
        {search === '' && (
          <div className='mt-5 px-8'>
            <ul className='text-text-tertiary body2-regular flex list-disc flex-col gap-2'>
              <li>
                시/군/구 + 도로명, 동명 또는 건물명 <br />
                <span>예) 동해시 중앙로, 여수 중앙동, 대전 현대아파트</span>
              </li>
              <li>도로명 + 건물번호 예) 종로 6</li>
              <li>읍/면/동/리 + 지번 예) 서린동 154-1 </li>
            </ul>
          </div>
        )}

        {/* 검색어 있을 때 결과 */}
        {mockResults.length > 0 && (
          <div className='mt-5 px-4'>
            <ul>
              {mockResults.map((item, index) => (
                <li
                  key={index}
                  className='border-b border-neutral-100 py-4 last:border-b-0'
                >
                  <div className='body2-semibold'>
                    {highlightText(item.main, search)}
                  </div>
                  <span className='body2-regular text-text-tertiary'>
                    {highlightText(item.sub, search)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* 검색 결과가 없을때, */}
        {search !== '' && mockResults.length === 0 && (
          <div className='flex min-h-[300px] flex-col items-center justify-center px-4 text-center'>
            <span className='h3-semibold text-primitive-neutral-900'>
              검색 결과가 없어요
            </span>
            <span className='body1-regular text-primitive-neutral-600 mt-1'>
              검색어를 확인해주세요
            </span>
          </div>
        )}
      </div>
    </>
  );
}
