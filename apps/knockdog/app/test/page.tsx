'use client';
import { useState } from 'react';
import { Trash, Close } from '@knockdog/icons';

const filterOptions = {
  '영업 시간': ['영업중', '공휴일 영업', '거리순'],
  '견종 조건': ['견종 무관', '소형견 전용', '중대형견 전용'],
  '강아지 서비스': [
    '데이케어',
    '호텔링',
    '24시간 상주',
    '분반 돌봄',
    '성격·성향 진단',
    '목욕',
    '산책',
    '훈련',
    '미용',
    '재활',
  ],
  '강아지 안전∙시설': [
    '미끄럼방지 바닥',
    'CCTV',
    '놀이터',
    '루프탑·테라스',
    '운동장·마당',
  ],
  '방문객 편의∙시설': [
    '픽드랍',
    '1:1 알림장',
    '강아지 카페',
    '주차장',
    '발렛파킹',
  ],
  '상품 유형': ['횟수권', '정기권', '멤버십'],
};

interface FilterState {
  [key: string]: string[];
}

export default function FilterModal() {
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({});
  const [resultCount, setResultCount] = useState<number | null>(null);

  const toggleOption = (category: string, option: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  };

  const removeSingleFilter = (category: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[category];
      if (!current) return prev;
      const updated = current.filter((v) => v !== value);
      const next = { ...prev };
      if (updated.length > 0) {
        next[category] = updated;
      } else {
        delete next[category];
      }
      return next;
    });
  };

  const handleSearch = () => {
    const total = Math.floor(Math.random() * 1200); // 서버 요청으로 변경 예정
    setResultCount(total);
  };

  const resetFilters = () => {
    setSelectedFilters({});
    setResultCount(null);
  };

  const isSelected = (category: string, option: string) => {
    return selectedFilters[category]?.includes(option);
  };

  return (
    <div className='h-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-md'>
      <h2 className='mb-4 text-xl font-bold text-[#15161B]'>필터</h2>

      {Object.entries(filterOptions).map(([category, options]) => (
        <div
          key={category}
          className='pb-[16px] pt-[16px] first:pt-[28px] last:pb-[28px]'
        >
          <h3 className='mb-2 text-[16px] font-bold leading-[24px] tracking-[-0.16px] text-[#15161B]'>
            {category}
          </h3>
          <div className='flex flex-wrap gap-[16px]'>
            {options.map((option) => (
              <button
                key={option}
                className={`flex h-[38px] items-center gap-[4px] rounded-lg border border-[#EBEBF0] px-[14px] py-[9px] text-center text-[14px] font-semibold leading-[20px] tracking-[-0.14px] transition-colors ${
                  isSelected(category, option)
                    ? 'bg-[#41424A] text-[#F3F3F7]'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                onClick={() => toggleOption(category, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* 선택된 필터 태그 + 삭제 아이콘 (같은 flex row 안에 배치) */}
      {Object.values(selectedFilters).flat().length > 0 && (
        <div className='mb-6 mt-[28px] flex flex-wrap items-center gap-2'>
          <div className='flex h-[38px] items-center'>
            <button
              className='flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-[#EBEBF0] p-2'
              onClick={resetFilters}
            >
              <Trash width={16} height={16} fill='#fff' />
            </button>
          </div>

          {Object.entries(selectedFilters).flatMap(([category, values]) =>
            values.map((value) => (
              <div
                key={`${category}-${value}`}
                className='flex h-[38px] items-center gap-[4px] rounded-lg border border-[#EBEBF0] bg-[#41424A] px-[14px] py-[9px] text-center text-[14px] font-semibold leading-[20px] tracking-[-0.14px] text-[#F3F3F7]'
              >
                <span>{value}</span>
                <button
                  className='flex h-[20px] w-[20px] items-center justify-center p-[1.667px]'
                  onClick={() => removeSingleFilter(category, value)}
                >
                  <Close width={16} height={16} fill='#F3F3F7' />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 액션 버튼들 */}
      <div className='flex items-center gap-4'>
        <button
          className='text-secondary flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#B4B4BB] bg-[#FFFFFF] px-4 py-4 hover:bg-gray-50'
          onClick={resetFilters}
        >
          닫기
        </button>
        <button
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-4 py-4 font-semibold text-[#F3F3F7] ${
            resultCount === 0
              ? 'cursor-not-allowed bg-gray-300'
              : 'bg-[#FF6E0C] hover:bg-[#FF6E0C]/90'
          }`}
          disabled={resultCount === 0}
          onClick={handleSearch}
        >
          {resultCount === null
            ? '결과보기'
            : `결과보기 ${resultCount > 999 ? '999+' : resultCount}개`}
        </button>
      </div>
    </div>
  );
}
