'use client';

import { Icon } from '@knockdog/ui';
import { useState } from 'react';
import { cn } from '@knockdog/ui/lib';

const checkOptions = [
  {
    key: 'closed',
    title: '폐업한 가게에요!',
    description: '폐업 전경, 안내문 등 폐업 사실을 보여주는 사진',
  },
  {
    key: 'price',
    title: '상품 및 가격 정보가 달라요!',
    description: '가격표, 전단지 등 최신 상품 및 가격 정보를 보여주는 사진',
  },
  {
    key: 'phone',
    title: '전화번호가 달라요!',
    description: '명함, 간판, 전단지 등 현재 전화번호를 보여주는 사진',
  },
  {
    key: 'time',
    title: '영업시간이 달라요!',
    description: '영업시간을 보여주는 사진',
  },
  {
    key: 'address',
    title: '주소가 달라요!',
    description: '주소 정보를 입력해 주세요',
  },
];

export default function Page() {
  const [checkedList, setCheckedList] = useState<string[]>([]);

  return (
    <>
      <div className='h-[calc(100vh-155px)] overflow-y-auto pb-6'>
        <div className='label-medium bg-fill-primary-50 text-text-secondary mt-[65px] px-4 py-3'>
          최대 <span className='text-text-accent'>3장</span>까지 등록 가능
        </div>
        {checkOptions.map((option) => {
          const isChecked = checkedList.includes(option.key);

          return (
            <div key={option.key} className='flex flex-col'>
              <div className='flex gap-2 p-4'>
                <label className='inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    className='peer hidden'
                    checked={isChecked}
                    onChange={() => {
                      setCheckedList((prev) => {
                        if (isChecked) {
                          return prev.filter((k) => k !== option.key);
                        } else {
                          if (prev.length >= 3) return prev; // 최대 3개 제한
                          return [...prev, option.key];
                        }
                      });
                    }}
                  />
                  <div className='border-line-400 peer-checked:border-primitive-orange-500 peer-checked:bg-primitive-orange-500 flex h-5 w-5 items-center justify-center rounded-sm border'>
                    <Icon
                      icon='Check'
                      className='h-4 w-4 stroke-[#fff] text-white opacity-0 transition-opacity peer-checked:opacity-100'
                    />
                  </div>
                </label>
                <div className='flex flex-col'>
                  <span className='body1-extrabold'>{option.title}</span>
                  <span className='body2-regular text-text-tertiary'>
                    {option.description}
                  </span>
                </div>
              </div>

              {/* 조건부 렌더링: 체크된 항목에 따라 부가 UI 표시 */}
              {option.key === 'closed' && isChecked && (
                <div className='my-5 px-4'>
                  <button className='border-primitive-neutral-400 text-text-secondary body2-bold w-full rounded-lg border px-4 py-[14px]'>
                    <Icon icon='Plus' className='inline-block h-4 w-4' />
                    사진등록
                  </button>
                </div>
              )}

              {option.key === 'address' && isChecked && (
                <div className='my-5 flex gap-2 px-4'>
                  <button className='border-primitive-neutral-400 text-text-secondary body2-bold flex-1 rounded-lg border px-4 py-[14px]'>
                    지도에서 선택
                  </button>
                  <button className='border-primitive-neutral-400 text-text-secondary body2-bold flex-1 rounded-lg border px-4 py-[14px]'>
                    직접입력
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className='z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <button
          className={cn(
            'body1-bold flex-1 rounded-lg px-4 py-[14px]',
            checkedList.length > 0
              ? 'bg-fill-primary-500 border-accent border text-neutral-100'
              : 'bg-fill-primary-50 text-text-secondary-inverse'
          )}
        >
          정보 수정 제보하기 {checkedList.length}개
        </button>
      </div>
    </>
  );
}
