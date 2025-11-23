'use client';

import { Controller } from 'react-hook-form';

import { Field } from '@knockdog/ui';
import { FieldLabel } from '@knockdog/ui';
import { TextField } from '@knockdog/ui';
import { TextFieldInput } from '@knockdog/ui';
import { Divider } from '@knockdog/ui';
import { ActionButton } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { AddressPicker } from '@features/address-picker';
import { USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR } from '@entities/user';
import { useLocationAddPage } from '../model/useLocationAddPage';

function LocationAddPage() {
  const { type, control, isValid, submit, handleSubmit } = useLocationAddPage();

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.BackButton />
        <Header.Title>장소 추가하기</Header.Title>
      </Header>

      <div className='flex flex-1 flex-col overflow-hidden px-4 pt-10 pb-5'>
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
              <Field hidden={type !== USER_ADDRESS_TYPE.OTHER}>
                <FieldLabel>장소 이름</FieldLabel>

                <TextField variant='secondary'>
                  <TextFieldInput placeholder='장소 이름을 등록하세요' {...field} />
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

        <ActionButton variant='secondaryFill' form='address-search-form' type='submit' size='large' disabled={!isValid}>
          등록하기
        </ActionButton>
      </div>
    </div>
  );
}

export { LocationAddPage };
