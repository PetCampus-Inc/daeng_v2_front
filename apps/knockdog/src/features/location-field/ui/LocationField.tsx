'use client';

import { Divider, Field, FieldContent, FieldLabel, FieldLabelIndicator, Icon } from '@knockdog/ui';

import { USER_ADDRESS_TYPE, UserAddress, UserAddressType } from '@entities/user';

import { useLocationField } from '../model/useLocationField';

interface LocationFieldProps {
  type: UserAddressType;
  required?: boolean;
  optional?: boolean;
  onChange?: (address?: Omit<UserAddress, 'id'>) => void;
}

export function LocationField({ type, required, optional, onChange }: LocationFieldProps) {
  const { alias, address, add, modify, remove } = useLocationField({ type, onChange });

  return (
    <div className='flex flex-col gap-y-2 py-5'>
      <Field>
        <FieldLabel className='h3-extrabold flex items-center'>
          <div className='flex-1'>
            {alias}

            {required && <FieldLabelIndicator type='required' />}
            {optional && <FieldLabelIndicator type='optional' />}
          </div>

          {address && (
            <div className='flex items-center gap-x-1'>
              {type !== USER_ADDRESS_TYPE.HOME && (
                <>
                  <button
                    className='label-semibold text-text-tertiary flex items-center gap-1 px-2 py-1'
                    type='button'
                    onClick={remove}
                  >
                    <Icon icon='Edit' className='text-fill-secondary-400 size-4' />
                    삭제
                  </button>
                  <Divider orientation='vertical' className='h-3.5' />
                </>
              )}

              <button
                className='label-semibold text-text-tertiary flex items-center gap-1 px-2 py-1'
                type='button'
                onClick={modify}
              >
                <Icon icon='Edit' className='text-fill-secondary-400 size-4' />
                수정
              </button>
            </div>
          )}
        </FieldLabel>

        <FieldContent>
          <button className='text-left' type='button' onClick={add}>
            {address ? (
              <span className='text-text-primary body1-regular'>{address.address}</span>
            ) : (
              <span className='text-text-tertiary body1-bold flex items-center gap-x-1'>
                <Icon icon='Plus' className='size-4' />
                추가하기
              </span>
            )}
          </button>
        </FieldContent>
      </Field>
    </div>
  );
}
