'use client';

import { useEffect, useState } from 'react';
import { ActionButton, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import Link from 'next/link';
import { cn } from '@knockdog/ui/lib';
import { useHeaderContext } from '@widgets/Header';

export default function Page() {
  const { setTitle } = useHeaderContext();
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [neuter, setNeuter] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
    setTitle('프로필 등록');
  }, [setTitle]);

  return (
    <div className='mt-[86px] px-4'>
      {/* progress 영역 */}
      <div className='flex gap-x-[6px] py-2'>
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-200 h-[6px] flex-1 rounded-full' />
        <div className='bg-fill-secondary-700 h-[6px] flex-1 rounded-full' />
      </div>
      <div className='flex flex-col gap-y-[40px] overflow-y-auto py-5'>
        <h1 className='h1-extrabold'>
          살구의 <span className='text-text-accent'>몸무게</span>를
          <br />
          알려주세요
        </h1>

        <div>
          <TextField label='몸무게' indicator='(선택)'>
            <TextFieldInput placeholder='소수점 한자리까지 입력 가능' />
          </TextField>
        </div>

        <div>
          <label className='text-text-primary body2-bold block pb-2'>
            중성화 여부
            <span className='caption1-semibold text-text-tertiary'>(선택)</span>
          </label>
          <div className='flex gap-x-2'>
            <button
              type='button'
              className={cn(
                'bg-fill-secondary-50 body2-semibold text-text-primary flex-1 rounded-lg p-[14px] transition-colors',
                neuter === 'yes' &&
                  'bg-fill-secondary-700 text-text-primary-inverse'
              )}
              onClick={() => setNeuter('yes')}
            >
              했어요
            </button>
            <button
              type='button'
              className={cn(
                'bg-fill-secondary-50 body2-semibold text-text-primary flex-1 rounded-lg p-[14px] transition-colors',
                neuter === 'no' &&
                  'bg-fill-secondary-700 text-text-primary-inverse'
              )}
              onClick={() => setNeuter('no')}
            >
              안했어요
            </button>
          </div>
        </div>

        <div className='py-2'>
          <label className='text-text-primary body2-bold block pb-2'>
            성별
            <span className='caption1-semibold text-text-tertiary'>(선택)</span>
          </label>
          <div className='flex gap-x-2'>
            <button
              type='button'
              className={cn(
                'bg-fill-secondary-50 body2-semibold text-text-primary flex-1 rounded-lg p-[14px] transition-colors',
                gender === 'male' &&
                  'bg-fill-secondary-700 text-text-primary-inverse'
              )}
              onClick={() => setGender('male')}
            >
              남자아이
            </button>
            <button
              type='button'
              className={cn(
                'bg-fill-secondary-50 body2-semibold text-text-primary flex-1 rounded-lg p-[14px] transition-colors',
                gender === 'female' &&
                  'bg-fill-secondary-700 text-text-primary-inverse'
              )}
              onClick={() => setGender('female')}
            >
              여자아이
            </button>
          </div>
        </div>

        <div>
          <TextField label='테어난 해' indicator='(선택)' required>
            <TextFieldInput placeholder='년도를 선택해 주세요' />
          </TextField>
        </div>
        <TextField
          required
          label='견종'
          prefix={<Icon icon='Search' />}
          disabled
          indicator='(선택)'
        >
          <TextFieldInput placeholder='견종을 검색해 보세요' />
        </TextField>
      </div>

      <div className='fixed bottom-0 left-0 right-0 flex gap-x-2 bg-white px-4 py-5'>
        <Link href='/signup/complete' className='flex-1'>
          <ActionButton variant='secondaryFill' className='w-full'>
            다음
          </ActionButton>
        </Link>
      </div>
    </div>
  );
}
