import React from 'react';

import { Field, FieldLabel, Icon, TextField, TextFieldInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { highlightSpanText } from '../lib/renderHighlightText';
import { useAddressPicker } from '../model/useAddressPicker';
import { Address } from '@entities/address';

interface AddressPickerProps extends Omit<React.ComponentProps<'div'>, 'onSelect'> {
  value?: string;
  onSelect?: (address: Address) => void;
}

export function AddressPicker({ className, value, onSelect, ...props }: AddressPickerProps) {
  const { addressList, inputValue, isSelected, handleSelect, handleChange } = useAddressPicker({
    value,
    onSelect,
  });

  const isEmpty = inputValue === '' || isSelected;

  return (
    <div className={cn('flex h-full flex-col gap-4', className)} {...props}>
      {/* 주소 검색 필드 */}
      <Field>
        <FieldLabel>주소</FieldLabel>

        <TextField prefix={<Icon icon='Search' />} variant='secondary'>
          <TextFieldInput value={inputValue} onChange={handleChange} placeholder='시/군/구 혹은 도로명 검색' />
        </TextField>
      </Field>

      <div className='flex-1 overflow-hidden'>
        {/* 주소 검색 힌트 (초기 상태) */}
        {isEmpty && <AddressPickerHint className='px-6' />}

        {/* 주소 리스트 (검색 결과가 있을 때) */}
        <div className='h-full overflow-y-auto'>
          {!isEmpty && (
            <AddressList className='px-4'>
              {addressList?.map((address, index) => (
                <AddressListItem
                  key={index}
                  address={address.address}
                  roadAddress={address.roadAddress}
                  keyword={inputValue}
                  onClick={handleSelect(address)}
                />
              ))}
            </AddressList>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 검색 결과 리스트 컴포넌트
 */
function AddressList({ children, ...props }: React.ComponentProps<'ul'>) {
  const hasChildren = Array.isArray(children) && children.length > 0;

  // children이 없다면 AddressListFallback을 보여줌
  if (!hasChildren) return <AddressListFallback className='mt-10' />;

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
