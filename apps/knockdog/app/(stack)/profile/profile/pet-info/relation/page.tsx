'use client';

import { useEffect, useState } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import Link from 'next/link';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '@widgets/Header';
import { BottomSheet } from '@shared/ui/bottom-sheet';

const RELATION_OPTIONS = [
  { label: '엄마', value: 'mother' },
  { label: '아빠', value: 'father' },
  { label: '가족', value: 'family' },
  { label: '보호자', value: 'guardian' },
  { label: '기타', value: 'etc' },
];

export default function PetInfoRelationPage() {
  const { setTitle } = useHeaderContext();

  const [petName, setPetName] = useState('살구');

  const [relation, setRelation] = useState<string>('mother');
  const [customRelation, setCustomRelation] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <>
      <div className='mt-[86px] px-4'>
        <div className='flex flex-col gap-y-4 py-5'>
          <h1 className='h1-extrabold'>
            살구와 어떤
            <span className='text-text-accent'>관계</span>인가요?
          </h1>

          <div className='flex items-end gap-x-1'>
            <div className='w-1/2'>
              <TextField label='관계' required disabled>
                <TextFieldInput value={petName} onChange={(e) => setPetName(e.target.value)} />
              </TextField>
            </div>
            <div className='w-1/2'>
              <div
                className='border-line-200 body1-regular text-text-tertiary flex h-[46px] w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-3 whitespace-nowrap'
                onClick={() => setIsOpen(true)}
              >
                관계 선택
                <Icon icon='ChevronBottom' className='h-5 w-5' />
              </div>
            </div>
          </div>
          <div className='py-1'>
            <TextField>
              <TextFieldInput
                placeholder='5자 이내 한글'
                value={customRelation}
                onChange={(e) => setCustomRelation(e.target.value)}
              />
            </TextField>
          </div>
        </div>

        <div className='fixed right-0 bottom-0 left-0 flex gap-x-2 bg-white px-4 py-5'>
          <Link href='/signup/profile/pet-info' className='flex-1'>
            <ActionButton variant='secondaryFill' className='w-full' disabled={petName.length === 0}>
              다음
            </ActionButton>
          </Link>
        </div>
      </div>
      {/* bottom sheet container */}
      <BottomSheet.Root open={isOpen} onOpenChange={setIsOpen}>
        <BottomSheet.Body>
          <BottomSheet.Handle />
          <BottomSheet.Header className='border-line-200 justify-between border-b'>
            <BottomSheet.Title>관계 선택</BottomSheet.Title>
            <BottomSheet.CloseButton />
          </BottomSheet.Header>
          <div className='px-6'>
            {RELATION_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'body2-semibold flex cursor-pointer items-center justify-between py-4',
                  relation === option.value && 'text-text-accent'
                )}
                onClick={() => setRelation(option.value)}
              >
                <label className='flex cursor-pointer items-center gap-x-2' htmlFor={option.value}>
                  {option.label}
                </label>
                <input
                  type='radio'
                  name='relation'
                  value={option.value}
                  checked={relation === option.value}
                  onChange={() => setRelation(option.value)}
                  id={option.value}
                  className='sr-only'
                />
                <span
                  className={cn(
                    'relative m-[3px] inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-400 transition-colors',
                    relation === option.value && 'border-text-accent'
                  )}
                >
                  {relation === option.value && <span className='bg-text-accent block h-3 w-3 rounded-full' />}
                </span>
              </div>
            ))}
          </div>
        </BottomSheet.Body>
      </BottomSheet.Root>
    </>
  );
}
