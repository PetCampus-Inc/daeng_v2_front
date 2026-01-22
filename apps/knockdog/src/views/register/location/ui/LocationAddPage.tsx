'use client';

import { Controller } from 'react-hook-form';

import { Field, FieldLabel, TextField, TextFieldInput, Divider, ActionButton } from '@knockdog/ui';
import { Suspense } from 'react';

import { useLocationAddPage } from '../model/useLocationAddPage';

import { Header } from '@widgets/Header';
import { AddressPicker } from '@features/address-picker';
import { USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR } from '@entities/user';

function LocationAddPage() {
  const { type, control, isValid, submit, handleSubmit } = useLocationAddPage();

  return (
    <div className='flex h-full flex-col pb-5'>
      <Header>
        <Header.BackButton />
        <Header.Title>장소 추가하기</Header.Title>
      </Header>

      <Suspense>
        <div className='flex flex-1 flex-col overflow-hidden px-4 pt-10'>
          <p className='h3-extrabold'>
            {type && USER_ADDRESS_TYPE_KR[type]}
            <span className='body1-extrabold text-text-accent'>*</span>
          </p>

          <Divider className='my-4' />

          <form
            id='address-search-form'
            className='flex flex-1 flex-col overflow-hidden pb-5'
            onSubmit={submit(handleSubmit)}
          >
            {/* 장소 이름 필드 */}
            <Controller
              control={control}
              name='alias'
              render={({ field }) => (
                <Field hidden={type !== USER_ADDRESS_TYPE.WORK}>
                  <FieldLabel>장소 이름</FieldLabel>

                  <TextField variant='secondary'>
                    <TextFieldInput placeholder={USER_ADDRESS_TYPE_KR[type]} {...field} />
                  </TextField>
                </Field>
              )}
            />

            {/* 주소 검색 */}
            <div className='mt-4 flex-1 overflow-hidden'>
              <Controller
                control={control}
                name='address'
                render={({ field }) => <AddressPicker value={field.value?.address} onSelect={field.onChange} />}
              />
            </div>
          </form>

          <ActionButton
            variant='secondaryFill'
            form='address-search-form'
            type='submit'
            size='large'
            disabled={!isValid}
          >
            등록하기
          </ActionButton>
        </div>
      </Suspense>
    </div>
  );
}

export { LocationAddPage };
