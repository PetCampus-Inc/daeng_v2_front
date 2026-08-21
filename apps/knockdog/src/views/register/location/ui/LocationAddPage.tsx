'use client';

import { Controller } from 'react-hook-form';

import {
  Field,
  FieldLabel,
  TextField,
  TextFieldInput,
  Divider,
  ActionButton,
  IconButton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';
import { Suspense } from 'react';
import { overlay } from 'overlay-kit';

import { useLocationAddPage } from '../model/useLocationAddPage';
import { formatAddressDetail } from '../model/formatAddressDetail';

import { Header } from '@widgets/Header';
import { AddressPicker } from '@features/address-picker';
import { USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR } from '@entities/user';

const MAX_LOCATION_NAME_LENGTH = 5;

function LocationAddPage() {
  const { type, control, canSubmit, hasAddress, isDirty, back, submit, handleSubmit, handleAddressSelect, handleAddressClear } =
    useLocationAddPage();

  const handleBack = () => {
    // 작성한 내용이 없으면 바로 뒤로가기
    if (!isDirty) {
      back();
      return;
    }

    // 변경사항이 있으면 확인 다이얼로그 표시
    overlay.open(({ isOpen, close }) => (
      <AlertDialog open={isOpen} onOpenChange={close}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>저장하지 않고 나갈까요?</AlertDialogTitle>
            <AlertDialogDescription>변경한 내용이 저장되지 않아요.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            <AlertDialogAction onClick={() => back()}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ));
  };

  return (
    <div className='flex h-full flex-col pb-5'>
      <Header>
        <Header.BackButton onClick={handleBack} />
        <Header.Title>주소 등록하기</Header.Title>
      </Header>

      <Suspense>
        <div className='flex flex-1 flex-col px-4 pt-5'>
          {type !== USER_ADDRESS_TYPE.WORK && (
            <>
              <p className='h3-extrabold'>{type && USER_ADDRESS_TYPE_KR[type]}</p>
              <Divider className='my-4' />
            </>
          )}

          <form
            id='address-search-form'
            className='flex flex-1 flex-col pb-5'
            onSubmit={submit(handleSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            noValidate
          >
            {/* 장소 이름 필드 */}
            <Controller
              control={control}
              name='alias'
              render={({ field }) => (
                <Field hidden={type !== USER_ADDRESS_TYPE.WORK}>
                  <FieldLabel>
                    장소 이름<span className='text-text-accent'>*</span>
                  </FieldLabel>

                  <TextField
                    className='h-x13'
                    suffix={
                      field.value ? (
                        <IconButton
                          type='button'
                          icon='DeleteInput'
                          iconClassName='text-fill-secondary-700'
                          aria-label='장소 이름 지우기'
                          onClick={() => field.onChange('')}
                        />
                      ) : undefined
                    }
                  >
                    <TextFieldInput
                      placeholder='등록할 장소의 이름을 입력해 주세요'
                      maxLength={MAX_LOCATION_NAME_LENGTH}
                      {...field}
                    />
                  </TextField>
                </Field>
              )}
            />

            {/* 주소 섹션 */}
            <div
              className={cn(
                'relative z-10 flex flex-col gap-y-2',
                type === USER_ADDRESS_TYPE.WORK && 'mt-8'
              )}
            >
              <div className='flex flex-col'>
                <div className='body2-bold text-text-primary flex h-5 items-center gap-0.5 mb-2'>
                  주소<span className='text-text-accent'>*</span>
                </div>

                <Controller
                  control={control}
                  name='address'
                  render={({ field }) => (
                    <AddressPicker
                      variant='embedded'
                      showLabel={false}
                      fieldVariant='default'
                      clearOnReselect
                      inputClassName='h-x12'
                      value={field.value?.roadAddress || field.value?.address}
                      onSelect={handleAddressSelect}
                      onClear={handleAddressClear}
                    />
                  )}
                />
              </div>

              <div className=''>
                <Controller
                  control={control}
                  name='address.detail'
                  render={({ field }) => (
                    <TextField
                      className='h-x13'
                      suffix={
                        hasAddress && field.value ? (
                          <IconButton
                            type='button'
                            icon='DeleteInput'
                            iconClassName='text-fill-secondary-700'
                            aria-label='상세 주소 지우기'
                            onClick={() => field.onChange('')}
                          />
                        ) : undefined
                      }
                    >
                      <TextFieldInput
                        value={field.value ?? ''}
                        placeholder='상세 주소를 입력해 주세요'
                        disabled={!hasAddress}
                        onChange={(event) => field.onChange(formatAddressDetail(event.target.value))}
                      />
                    </TextField>
                  )}
                />
              </div>
            </div>
          </form>

          <ActionButton
            variant='primaryFill'
            form='address-search-form'
            type='submit'
            size='large'
            disabled={!canSubmit}
          >
            등록하기
          </ActionButton>
        </div>
      </Suspense>
    </div>
  );
}

export { LocationAddPage };
