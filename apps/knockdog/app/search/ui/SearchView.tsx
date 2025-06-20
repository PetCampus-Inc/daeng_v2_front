import { Icon, TextField, TextFieldInput } from '@knockdog/ui';
import React from 'react';
import { InputChip } from './InputChip';

export function SearchView({ handleBack }: { handleBack: () => void }) {
  return (
    <div className='bg-fill-secondary-0 flex min-h-screen flex-col'>
      {/* 검색창 헤더 */}
      <div className='py-x2 pr-x4 pl-x2 gap-x-x2 pt-[calc(env(safe-area-inset-top) + 8px)] flex'>
        <button onClick={handleBack} className='px-x2 shrink-0'>
          <Icon icon='ChevronLeft' className='size-x6' />
        </button>
        <TextField
          prefix={
            <Icon icon='Search' className='size-x6 text-fill-secondary-700' />
          }
          className='bg-fill-secondary-50 h-x12 border-0'
        >
          <TextFieldInput
            type='text'
            placeholder='업체 또는 주소를 검색하세요'
            autoFocus
          />
        </TextField>
      </div>
      {/* 검색 히스토리 또는 결과 영역 */}
      <main className='flex-1 overflow-auto'>
        <section className='gap-x4 mt-[34px] flex flex-col'>
          <div className='px-x4 flex items-center justify-between'>
            <h3 className='body1-extrabold text-text-primary'>
              최근 찾아본 장소
            </h3>
            <button className='caption1-semibold text-text-tertiary px-x2 py-x1'>
              전체 삭제
            </button>
          </div>
          <div className='gap-x2 scrollbar-hide px-x4 flex overflow-x-scroll'>
            {mockData.map((item) => (
              <div key={item.id} className='flex-shrink-0'>
                <InputChip name={item.name} />
              </div>
            ))}
          </div>
        </section>

        <section className='gap-x4 mt-[34px] flex flex-col px-[16px]'>
          <div className='flex items-center justify-between'>
            <h3 className='body1-extrabold text-text-primary'>최근 검색어</h3>
            <button className='caption1-semibold text-text-tertiary px-x2 py-x1'>
              전체 삭제
            </button>
          </div>
          <div className='gap-x2 flex flex-col'>
            <div className='gap-x py-x2.5 flex items-center justify-between'>
              <a className='body2-regular text-text-primary gap-x-x1 inline-flex flex-1'>
                <Icon icon='Time' className='text-fill-secondary-400 size-x5' />
                검색어
              </a>
              <span className=''>
                <Icon
                  icon='Close'
                  className='size-x5 text-fill-secondary-700'
                />
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const mockData = [
  {
    id: 1,
    name: '미니마니모유치원',
  },
  {
    id: 2,
    name: '알함브라유치원',
  },
  {
    id: 3,
    name: '도레미파솔유치원',
  },
  {
    id: 4,
    name: '릴리릴리유치원',
  },
  {
    id: 5,
    name: '무지개빛유치원',
  },
  {
    id: 6,
    name: '계란탁유치원',
  },
  {
    id: 7,
    name: '파송송유치원',
  },
];
