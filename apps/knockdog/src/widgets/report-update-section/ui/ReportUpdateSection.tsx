'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { IconButton, ActionButton, TextField, TextFieldInput } from '@knockdog/ui';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { ReportOptionCard } from '@features/dog-school';
import { MAX_UPLOAD_COUNT } from '../model/validators';
import { checkOptions } from '../model/state';

type CheckedKey = (typeof checkOptions)[number]['key'];

export function ReportUpdateSection() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [checkedSet, setCheckedSet] = useState<Set<CheckedKey>>(new Set());
  const [currentAddress] = useState<string | null>('서울특별시 강남구 테헤란로 77-2');
  const [newAddress, setNewAddress] = useState<string | null>('서울특별시 강남구 테헤란로 77-2');

  const checkedList = useMemo(() => Array.from(checkedSet), [checkedSet]);
  const isChecked = useCallback((key: CheckedKey) => checkedSet.has(key), [checkedSet]);

  const toggleCheck = useCallback((key: CheckedKey, next: boolean) => {
    setCheckedSet((prev) => {
      const nextSet = new Set(prev);
      next ? nextSet.add(key) : nextSet.delete(key);
      return nextSet;
    });
  }, []);

  const needsPhotoUpload = useCallback(
    (key: CheckedKey) => key === 'closed' || key === 'price' || key === 'phone' || key === 'time',
    []
  );

  if (!slug) return null;

  return (
    <>
      <div>
        <div className='h-[calc(100vh-77px)] overflow-y-auto'>
          <div className='label-medium text-text-secondary bg-neutral-50 px-4 pb-3 pt-[80px]'>
            최대 <span className='text-text-accent'>{MAX_UPLOAD_COUNT}</span>장까지 등록 가능
          </div>

          {checkOptions.map((opt) => (
            <ReportOptionCard
              key={opt.key}
              checked={isChecked(opt.key)}
              title={opt.title}
              description={opt.description}
              onCheckedChange={(v) => toggleCheck(opt.key, v)}
            >
              {/* 공통: 사진 업로드 섹션 */}
              {needsPhotoUpload(opt.key) && (
                <div className='mt-5 px-4'>
                  <PhotoUploader maxCount={MAX_UPLOAD_COUNT} />
                </div>
              )}

              {/* 주소 변경 섹션 */}
              {opt.key === 'address' && (
                <div className='my-5 flex flex-col gap-3 px-4'>
                  <div className='flex flex-col gap-2'>
                    {currentAddress && (
                      <TextField disabled className='w-full' label='현재 등록된 주소'>
                        <TextFieldInput value={currentAddress} />
                      </TextField>
                    )}
                    <TextField
                      className='w-full'
                      label='변경할 주소'
                      suffix={
                        newAddress && (
                          <IconButton icon='DeleteInput' onClick={() => setNewAddress('')} className='cursor-pointer' />
                        )
                      }
                    >
                      <TextFieldInput
                        value={newAddress ?? ''}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder='도로명 주소를 입력하세요'
                      />
                    </TextField>
                  </div>

                  <div className='mt-5 flex gap-2'>
                    <ActionButton className='flex-1' variant='secondaryLine'>
                      지도에서 선택
                    </ActionButton>
                    <ActionButton asChild variant='secondaryLine' className='flex-1'>
                      <Link href={`/company/${slug}/report-info-update/manual-address`}>직접입력</Link>
                    </ActionButton>
                  </div>
                </div>
              )}
            </ReportOptionCard>
          ))}
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton disabled={checkedList.length === 0}>정보 수정 제보하기</ActionButton>
      </div>
    </>
  );
}
