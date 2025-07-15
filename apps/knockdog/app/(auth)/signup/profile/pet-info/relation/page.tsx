'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { useHeaderContext } from '@widgets/Header';

const ActionSheet = dynamic(() => import('./ActionSheet'), {
  ssr: false,
});

export default function PetInfoRelationPage() {
  const { setTitle } = useHeaderContext();

  const [petName, setPetName] = useState('살구');

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
                <TextFieldInput
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                />
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
            <ActionButton
              variant='secondaryFill'
              className='w-full'
              disabled={petName.length === 0}
            >
              다음
            </ActionButton>
          </Link>
        </div>
      </div>
      {/* bottom sheet container */}
      <ActionSheet isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
