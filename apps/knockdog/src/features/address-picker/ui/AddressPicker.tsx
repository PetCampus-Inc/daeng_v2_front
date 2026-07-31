import React from 'react';

import { Field, FieldLabel, Icon, IconButton, TextField, TextFieldInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { highlightSpanText } from '../lib/renderHighlightText';
import { useAddressPicker } from '../model/useAddressPicker';
import { Address } from '@entities/address';

interface AddressPickerProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  value?: string;
  onSelect?: (address: Address) => void;
  onClear?: () => void;
  showLabel?: boolean;
  placeholder?: string;
  variant?: 'page' | 'embedded';
  fieldVariant?: 'default' | 'secondary';
  /** 선택 후 재포커스 시 입력 삭제 + 목록 재표시, 목록 선택만 반영 */
  clearOnReselect?: boolean;
  inputClassName?: string;
}

export function AddressPicker({
  className,
  value,
  onSelect,
  onClear,
  showLabel = true,
  placeholder = '시/군/구 혹은 도로명 검색',
  variant = 'page',
  fieldVariant = 'secondary',
  clearOnReselect = false,
  inputClassName,
  ...props
}: AddressPickerProps) {
  const {
    addressList,
    inputValue,
    searchQuery,
    isSelected,
    handleSelect,
    handleChange,
    handleFocus,
    handleBlur,
    handleClear,
  } = useAddressPicker({
    value,
    onSelect,
    onClear,
    clearOnReselect,
  });

  const isEmbedded = variant === 'embedded';
  const showHint = !isEmbedded && !isSelected && inputValue === '' && searchQuery === '';
  const showResults = !isSelected && searchQuery.length > 0;
  const hasResults = (addressList?.length ?? 0) > 0;
  const listKeyword = inputValue || searchQuery;

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleClear();
    onClear?.();
  };

  const searchField = (
    <TextField
      className={cn(isEmbedded && 'h-x13', inputClassName)}
      prefix={<Icon icon='Search' className={cn(isEmbedded ? 'text-text-secondary' : 'size-x6')} />}
      variant={fieldVariant}
      suffix={
        inputValue ? (
          <IconButton
            type='button'
            icon='DeleteInput'
            className={isEmbedded ? 'text-text-tertiary' : undefined}
            iconClassName={cn(!isEmbedded && 'size-x5 text-primitive-neutral-700')}
            onClick={handleClearClick}
            aria-label='검색어 삭제'
          />
        ) : undefined
      }
    >
      <TextFieldInput
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </TextField>
  );

  const resultsSection = (
    <>
      {showHint && <AddressPickerHint className={isEmbedded ? 'px-0 pt-1' : 'px-6'} />}

      {showResults && (
        <AddressList className={isEmbedded ? undefined : 'px-4'} showEmptyFallback={!isEmbedded}>
          {addressList?.map((address, index) => (
            <AddressListItem
              key={index}
              address={address.address}
              roadAddress={address.roadAddress}
              keyword={listKeyword}
              onPointerDown={(event) => {
                event.preventDefault();
                handleSelect(address)().catch((error) => {
                  console.error('주소 선택에 실패했습니다:', error);
                });
              }}
            />
          ))}
        </AddressList>
      )}
    </>
  );

  if (isEmbedded) {
    return (
      <div className={cn('relative', className)} {...props}>
        {searchField}
        {showResults && hasResults && (
          <div className='bg-fill-secondary-0 absolute inset-x-0 top-full z-10 max-h-[280px] overflow-y-auto'>
            <AddressList className='px-4' showEmptyFallback={false}>
              {addressList?.map((address, index) => (
                <AddressListItem
                  key={index}
                  address={address.address}
                  roadAddress={address.roadAddress}
                  keyword={listKeyword}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    handleSelect(address)().catch((error) => {
                      console.error('[AddressPicker] address selection failed:', error);
                    });
                  }}
                />
              ))}
            </AddressList>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col gap-4', className)} {...props}>
      <Field>
        {showLabel && <FieldLabel>주소</FieldLabel>}
        {searchField}
      </Field>

      <div className='flex-1 overflow-hidden'>
        <div className='h-full overflow-y-auto'>{resultsSection}</div>
      </div>
    </div>
  );
}

/**
 * 검색 결과 리스트 컴포넌트
 */
function AddressList({
  children,
  showEmptyFallback = true,
  ...props
}: React.ComponentProps<'ul'> & { showEmptyFallback?: boolean }) {
  const hasChildren = React.Children.count(children) > 0;

  if (!hasChildren) {
    if (!showEmptyFallback) return null;

    return <AddressListFallback className='mt-10' />;
  }

  return <ul {...props}>{children}</ul>;
}

interface AddressListItemProps extends React.ComponentProps<'li'> {
  address: string;
  roadAddress: string;
  keyword: string;
  onClick?: () => void;
}

/**
 * 검색 결과 리스트 아이템 컴포넌트
 */
function AddressListItem({ address, roadAddress, keyword, ...props }: AddressListItemProps) {
  return (
    <li className='border-b border-neutral-100 py-4 last:border-b-0' {...props}>
      <div className='body2-semibold'>{highlightSpanText(address, keyword)}</div>
      <span className='body2-regular text-text-tertiary'>{highlightSpanText(roadAddress, keyword)}</span>
    </li>
  );
}

/**
 * 주소 검색 힌트 컴포넌트
 */
function AddressPickerHint(props: React.ComponentProps<'div'>) {
  return (
    <div {...props}>
      <ul className='text-text-tertiary body2-regular flex list-disc flex-col gap-2 marker:text-[10px]'>
        <li>
          시/군/구 + 도로명, 동명 또는 건물명 <br />
          <span>예) 동해시 중앙로, 여수 중앙동, 대전 현대아파트</span>
        </li>
        <li>도로명 + 건물번호 예) 종로 6</li>
        <li>읍/면/동/리 + 지번 예) 서린동 154-1 </li>
      </ul>
    </div>
  );
}

/**
 * 검색 결과가 없을 때 표시하는 컴포넌트
 */
function AddressListFallback({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)} {...props}>
      <span className='h3-semibold text-primitive-neutral-900'>검색 결과가 없어요</span>
      <span className='body1-regular text-primitive-neutral-600 mt-1'>검색어를 확인해주세요</span>
    </div>
  );
}
