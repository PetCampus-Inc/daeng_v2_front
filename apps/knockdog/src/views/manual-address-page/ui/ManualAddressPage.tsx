'use client';

import { Controller } from 'react-hook-form';

import { ActionButton } from '@knockdog/ui';

import { Header } from '@widgets/Header';
import { AddressPicker } from '@features/address-picker';
import { useManualAddressPage } from '../model/useManualAddressPage';

export function ManualAddressPage() {
  const { control, isValid, submit, handleSubmit, handleSelect } = useManualAddressPage();

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>직접 주소 입력하기</Header.Title>
      </Header>

      <div className='flex flex-1 flex-col overflow-hidden px-4 pb-5'>
        <form
          id='address-search-form'
          className='flex flex-1 flex-col overflow-hidden pb-5'
          onSubmit={submit(handleSubmit)}
        >
          {/* 주소 검색 */}
          <div className='mt-4 flex-1 overflow-hidden'>
            <Controller
              control={control}
              name='address'
              render={({ field }) => (
                <AddressPicker
                  value={field.value?.address}
                  onSelect={(address) => {
                    field.onChange(address);
                    handleSelect(address);
                  }}
                />
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
