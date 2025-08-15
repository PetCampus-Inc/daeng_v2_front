'use client';

import { Icon, Checkbox, ActionButton } from '@knockdog/ui';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { useState } from 'react';
import { cn } from '@knockdog/ui/lib';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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

const MAX_UPLOAD_COUNT = 3;

export default function Page() {
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const { slug } = useParams();

  const handleCheckboxChange = (key: string, checked: boolean) => {
    if (checked) {
      setCheckedList(prev => [...prev, key]);
    } else {
      setCheckedList(prev => prev.filter(item => item !== key));
    }
  };

  return (
    <>
      <div className=''>
        
        <div className='overflow-y-auto h-[calc(100vh-77px)] '>
          <div className='label-medium bg-neutral-50 text-text-secondary pt-[80px] px-4 pb-3'>
            최대 <span className='text-text-accent'>{MAX_UPLOAD_COUNT}장</span>까지 등록 가능
          </div>
          {checkOptions.map((option, index) => {
            const isChecked = checkedList.includes(option.key);

              return (
                <div key={option.key} className='flex flex-col p-4' style={{paddingBottom: index === checkOptions.length - 1 ? '40px' : '0px'}}>
                  <div className='flex gap-2'>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => handleCheckboxChange(option.key, checked as boolean)}
                      >
                        <div className='flex flex-col'>
                          <span className='body1-extrabold'>{option.title}</span>
                          <span className='body2-regular text-text-tertiary'>
                            {option.description}
                          </span>
                        </div>
                      </Checkbox>
                  </div>

                  {/* 조건부 렌더링: 체크된 항목에 따라 부가 UI 표시 */}
                  {['closed', 'price', 'phone', 'time'].includes(option.key) && isChecked && (
                    <div className='mt-5 px-4'>
                      <PhotoUploader maxCount={MAX_UPLOAD_COUNT}/>
                    </div>
                  )}

                  {option.key === 'address' && isChecked && (
                    <div className='my-5 flex gap-2 px-4'>
                      <ActionButton className='flex-1' variant='secondaryLine'>
                        지도에서 선택
                      </ActionButton>
                      <ActionButton asChild={true} variant='secondaryLine'>
                        <Link
                          href={`/company/${slug}/report-info-update/manual-address`}
                          className='flex-1'
                        >
                          직접입력
                        </Link>
                      </ActionButton>
                    </div>
                  )}
                </div>
              );
          })}
        </div>
      </div>
      <div className='z-10 flex w-screen items-center gap-1 bg-white p-4 fixed bottom-0 left-0 right-0'>
        <ActionButton
          disabled={checkedList.length === 0}
        >
          정보 수정 제보하기
        </ActionButton>
      </div>
    </>
  );
}
