'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { IconButton, ActionButton, TextField, TextFieldInput } from '@knockdog/ui';
import { PhotoUploader } from '@shared/ui/photo-uploader';
import { ReportOptionCard } from '@features/dog-school';
import { checkOptions } from '../model/checkOptions';
import { useSearchParams } from 'next/navigation';
import { Header } from '@widgets/Header';
import { useRouter } from 'next/navigation';
import { useReportingMutate } from '../api/useReportingMutate';
import { useStackNavigation } from '@shared/lib/bridge';

type CheckedKey = (typeof checkOptions)[number]['key'];

const MAX_UPLOAD_COUNT = 3;

function ReportingKindergartenUpdate() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const searchParams = useSearchParams();
  const roadAddress = searchParams?.get('roadAddress') ?? null;

  const [checkedSet, setCheckedSet] = useState<Set<CheckedKey>>(new Set());
  const [newAddress, setNewAddress] = useState<string | null>();
  const [businessFiles, setBusinessFiles] = useState<File[]>([]); // 폐업
  const [priceFiles, setPriceFiles] = useState<File[]>([]);
  const [phoneFiles, setPhoneFiles] = useState<File[]>([]);
  const [hoursFiles, setHoursFiles] = useState<File[]>([]);

  const checkedList = useMemo(() => Array.from(checkedSet), [checkedSet]);
  const isChecked = useCallback((key: CheckedKey) => checkedSet.has(key), [checkedSet]);

  const { push } = useStackNavigation();

  if (!id) return null;

  const reportingParams = useMemo(() => {
    const params: any = {
      businessChange: checkedSet.has('closed') && businessFiles.length ? businessFiles : undefined,
      priceChange: checkedSet.has('price') && priceFiles.length ? priceFiles : undefined,
      phoneChange: checkedSet.has('phone') && phoneFiles.length ? phoneFiles : undefined,
      hoursChange: checkedSet.has('time') && hoursFiles.length ? hoursFiles : undefined,
    };

    // address가 체크되어 있고 값이 있을 때만 포함
    if (checkedSet.has('address') && newAddress && newAddress.trim() !== '') {
      params.address = newAddress;
    }

    return params;
  }, [checkedSet, newAddress, businessFiles, priceFiles, phoneFiles, hoursFiles]);

  const { mutate: reportingMutate, isPending } = useReportingMutate(id, reportingParams);

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

  return (
    <>
      <div className='sticky top-0 z-10'>
        <Header>
          <Header.LeftSection>
            <Header.BackButton />
          </Header.LeftSection>
          <Header.Title>정보 수정 제보하기</Header.Title>
        </Header>
      </div>

      <div>
        <div className='h-[calc(100vh-77px)]'>
          <div className='label-medium text-text-secondary bg-neutral-50 px-4 pb-3 pt-[10px]'>
            최대 <span className='text-text-accent'>{MAX_UPLOAD_COUNT}</span>장까지 등록 가능
          </div>

          <div className='h-[calc(100vh-167px)] overflow-y-auto'>
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
                    <PhotoUploader
                      maxCount={MAX_UPLOAD_COUNT}
                      onChange={(items) => {
                        const files = items.map((it) => it.file);
                        if (opt.key === 'closed') setBusinessFiles(files);
                        if (opt.key === 'price') setPriceFiles(files);
                        if (opt.key === 'phone') setPhoneFiles(files);
                        if (opt.key === 'time') setHoursFiles(files);
                      }}
                    />
                  </div>
                )}

                {/* 주소 변경 섹션 */}
                {opt.key === 'address' && (
                  <div className='my-5 flex flex-col gap-3 px-4'>
                    <div className='flex flex-col gap-2'>
                      {roadAddress && (
                        <TextField disabled className='w-full' label='현재 등록된 주소'>
                          <TextFieldInput value={roadAddress} />
                        </TextField>
                      )}
                      <TextField
                        className='w-full'
                        label='변경할 주소'
                        suffix={
                          newAddress && (
                            <IconButton
                              icon='DeleteInput'
                              onClick={() => setNewAddress('')}
                              className='cursor-pointer'
                            />
                          )
                        }
                      >
                        <TextFieldInput
                          value={newAddress ?? ''}
                          readOnly
                          onChange={(e) => setNewAddress(e.target.value)}
                        />
                      </TextField>
                    </div>

                    <div className='mt-5 flex gap-2'>
                      <ActionButton className='flex-1' variant='secondaryLine'>
                        지도에서 선택
                      </ActionButton>
                      <ActionButton
                        variant='secondaryLine'
                        className='flex-1'
                        onClick={() => push({ pathname: `/kindergarten/${id}/report-info-update/manual-address` })}
                      >
                        직접입력
                      </ActionButton>
                    </div>
                  </div>
                )}
              </ReportOptionCard>
            ))}
          </div>
        </div>
      </div>

      <div className='fixed bottom-0 left-0 right-0 z-10 flex w-screen items-center gap-1 bg-white p-4'>
        <ActionButton disabled={checkedList.length === 0 || isPending} onClick={() => reportingMutate(reportingParams)}>
          정보 수정 제보하기
        </ActionButton>
      </div>
    </>
  );
}

export { ReportingKindergartenUpdate };
