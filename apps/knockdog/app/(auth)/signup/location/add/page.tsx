'use client';

import { useEffect, useState } from 'react';
import { ActionButton, Divider, Icon } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';

export default function LocationAddPage() {
  const [search, setSearch] = useState('테헤란로');

  const { setTitle } = useHeaderContext();

  useEffect(() => {
    setTitle('장소 추가하기');
  }, [setTitle]);

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

  const highlightText = (text: string, keyword: string) => {
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
  };

  return (
    <div className='mt-[86px] px-4'>
      <div className='py-5'>
        <div className='flex flex-col'>
          <h2 className='h3-extrabold'>
            집<span className='body1-extrabold text-text-accent'>*</span>
          </h2>

          <Divider className='my-4' />

          <div className=''>
            <h3 className='body2-bold mb-2'>
              장소 이름
              <span className='body1-extrabold text-text-accent'>*</span>
              <span className='caption1-semibold text-text-tertiary'>(선택)</span>
            </h3>
            <div className='bg-primitive-neutral-50 my-2 flex items-center justify-between rounded-lg px-4 py-3'>
              <input placeholder='장소 이름을 등록하세요' className='body1-regular' />
              <span className='text-text-tertiary body1-regular'> 0/5</span>
            </div>
            <h3 className='body2-bold mb-2'>
              주소<span className='body1-extrabold text-text-accent'>*</span>
              <span className='caption1-semibold text-text-tertiary'>(선택)</span>
            </h3>
            <div className=''>
              <div className='bg-primitive-neutral-50 my-2 flex items-center gap-2 rounded-lg px-4 py-3'>
                <Icon icon='Search' className='h-5 w-5' />
                <input
                  placeholder='시/군/구 혹은 도로명 검색'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
                      <li key={index} className='border-b border-neutral-100 py-4 last:border-b-0'>
                        <div className='body2-semibold'>{highlightText(item.main, search)}</div>
                        <span className='body2-regular text-text-tertiary'>{highlightText(item.sub, search)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* 검색 결과가 없을때, */}
              {search !== '' && mockResults.length === 0 && (
                <div className='flex min-h-[300px] flex-col items-center justify-center px-4 text-center'>
                  <span className='h3-semibold text-primitive-neutral-900'>검색 결과가 없어요</span>
                  <span className='body1-regular text-primitive-neutral-600 mt-1'>검색어를 확인해주세요</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 bg-white px-4 py-5'>
        <ActionButton variant='secondaryFill' className='w-full'>
          등록하기
        </ActionButton>
      </div>
    </div>
  );
}
