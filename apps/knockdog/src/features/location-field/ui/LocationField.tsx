'use client';

import { overlay } from 'overlay-kit';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Divider,
  Field,
  FieldContent,
  FieldLabel,
  FieldLabelIndicator,
  Icon,
} from '@knockdog/ui';

import { USER_ADDRESS_TYPE, UserAddress, UserAddressType } from '@entities/user';

import { useLocationField } from '../model/useLocationField';
import { withEulReul } from '../lib/josa';

interface LocationFieldProps {
  type: UserAddressType;
  value?: Omit<UserAddress, 'id'>;
  required?: boolean;
  optional?: boolean;
  onChange?: (address?: Omit<UserAddress, 'id'>) => void;
  onAdd?: (address: Omit<UserAddress, 'id'>) => void | Promise<void>;
  onUpdate?: (address: Omit<UserAddress, 'id'>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export function LocationField({ type, value, required, optional, onChange, onAdd, onUpdate, onDelete }: LocationFieldProps) {
  const { alias, address, add, modify, remove } = useLocationField({ type, value, onChange, onAdd, onUpdate, onDelete });

  const handleDeleteClick = () => {
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{withEulReul(alias)} 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>삭제한 장소는 복구할 수 없어요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>삭제하기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <div className='flex flex-col gap-y-2 py-4'>
      <Field>
        <FieldLabel className='h3-extrabold flex items-center'>
          <div className='flex-1'>
            {alias}

            {required && <FieldLabelIndicator type='required' />}
            {optional && <FieldLabelIndicator type='optional' className='text-text-secondary body1-regular' />}
          </div>

          {address && (
            <div className='flex items-center gap-x-0.5'>
              {type !== USER_ADDRESS_TYPE.HOME && (
                <>
                  <button
                    className='label-semibold text-text-tertiary flex items-center gap-1 px-2 py-1'
                    type='button'
                    onClick={handleDeleteClick}
                  >
                    <Icon icon='Trash' className='text-fill-secondary-400 size-4' />
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
              <span className='text-text-tertiary body2-semibold flex items-center gap-x-1'>
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
