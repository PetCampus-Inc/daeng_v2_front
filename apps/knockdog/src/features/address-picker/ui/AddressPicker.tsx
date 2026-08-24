import React, { useEffect, useRef } from 'react';

import { Field, FieldLabel, Icon, IconButton, TextField, TextFieldInput } from '@knockdog/ui';
import { cn } from '@knockdog/ui/lib';

import { highlightSpanText } from '../lib/renderHighlightText';
import type { AddressSearchResult } from '../model/address';
import { useAddressPicker } from '../model/useAddressPicker';
import { Address } from '@entities/address';

function getScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  let node = el?.parentElement ?? null;

  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return node;
    }
    node = node.parentElement;
  }

  return null;
}

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
  embeddedResultsClassName?: string;
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
  embeddedResultsClassName,
  ref: externalRef,
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
    markListInteraction,
    endListInteraction,
  } = useAddressPicker({
    value,
    onSelect,
    onClear,
    clearOnReselect,
  });

  const isEmbedded = variant === 'embedded';
  const embeddedContainerRef = useRef<HTMLDivElement>(null);
  const scrollRestoreTimersRef = useRef<number[]>([]);
  const showHint = !isEmbedded && !isSelected && inputValue === '' && searchQuery === '';
  const showResults = !isSelected && searchQuery.length > 0;
  const hasResults = (addressList?.length ?? 0) > 0;
  const listKeyword = inputValue || searchQuery;

  const clearScrollRestoreTimers = () => {
    for (const timerId of scrollRestoreTimersRef.current) {
      window.clearTimeout(timerId);
    }
    scrollRestoreTimersRef.current = [];
  };

  useEffect(() => clearScrollRestoreTimers, []);

  const setEmbeddedContainerRef = (node: HTMLDivElement | null) => {
    embeddedContainerRef.current = node;

    if (typeof externalRef === 'function') {
      externalRef(node);
      return;
    }

    if (externalRef) {
      externalRef.current = node;
    }
  };

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    handleFocus();

    if (!isEmbedded) return;

    // iOS WebView: focus/키보드 시 overflow 조상이 scrollTop=0으로 리셋되는 경우만 되돌림.
    // scrollIntoView는 필드를 최상단으로 끌어올려서 쓰지 않음.
    const input = event.currentTarget;
    const scrollParent = getScrollableAncestor(input);
    if (!scrollParent) return;

    const savedTop = scrollParent.scrollTop;
    if (savedTop <= 8) return;

    clearScrollRestoreTimers();

    const restoreIfJumpedToTop = () => {
      if (document.activeElement !== input) return;
      if (scrollParent.scrollTop > 1) return;
      scrollParent.scrollTop = savedTop;
    };

    requestAnimationFrame(() => {
      restoreIfJumpedToTop();
      requestAnimationFrame(restoreIfJumpedToTop);
    });

    for (const delay of [50, 150, 350]) {
      scrollRestoreTimersRef.current.push(window.setTimeout(restoreIfJumpedToTop, delay));
    }
  };

  const handleInputBlur = () => {
    clearScrollRestoreTimers();
    handleBlur();
  };

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
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
      />
    </TextField>
  );

  const selectAddress = (address: AddressSearchResult) => {
    handleSelect(address)().catch((error) => {
      console.error('[AddressPicker] address selection failed:', error);
    });
  };

  const listInteractionProps = {
    onPointerDown: markListInteraction,
    onPointerUp: endListInteraction,
    onPointerCancel: endListInteraction,
  };

  const resultsSection = (
    <>
      {showHint && <AddressPickerHint className={isEmbedded ? 'px-0 pt-1' : 'px-6'} />}

      {showResults && (
        <AddressList
          className={isEmbedded ? undefined : 'px-4'}
          showEmptyFallback={!isEmbedded}
          {...listInteractionProps}
        >
          {addressList?.map((address, index) => (
            <AddressListItem
              key={index}
              address={address.address}
              roadAddress={address.roadAddress}
              keyword={listKeyword}
              onSelect={() => selectAddress(address)}
            />
          ))}
        </AddressList>
      )}
    </>
  );

  if (isEmbedded) {
    return (
      <div ref={setEmbeddedContainerRef} className={cn('relative', className)} {...props}>
        {searchField}
        {showResults && hasResults && (
          <div
            className={cn(
              'bg-fill-secondary-0 mt-2 max-h-[min(50dvh,22rem)] touch-pan-y overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]',
              embeddedResultsClassName
            )}
            {...listInteractionProps}
          >
            <AddressList className='px-4' showEmptyFallback={false}>
              {addressList?.map((address, index) => (
                <AddressListItem
                  key={index}
                  address={address.address}
                  roadAddress={address.roadAddress}
                  keyword={listKeyword}
                  onSelect={() => selectAddress(address)}
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

      <div className='min-h-0 flex-1 overflow-hidden'>
        <div
          className='h-full touch-pan-y overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]'
          {...listInteractionProps}
        >
          {resultsSection}
        </div>
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

const TAP_MOVE_THRESHOLD_PX = 10;

interface AddressListItemProps {
  address: string;
  roadAddress: string;
  keyword: string;
  onSelect: () => void;
}

/**
 * 검색 결과 리스트 아이템.
 * pointerdown에서 바로 선택하면 모바일 스크롤이 막히고 그 자리 주소가 선택됨.
 * 손가락이 움직였으면 click을 무시한다.
 */
function AddressListItem({ address, roadAddress, keyword, onSelect }: AddressListItemProps) {
  const ignoreClickRef = useRef(false);

  return (
    <li
      className='border-b border-neutral-100 py-4 last:border-b-0'
      onPointerDown={(event) => {
        ignoreClickRef.current = false;
        const startX = event.clientX;
        const startY = event.clientY;

        const handleMove = (moveEvent: PointerEvent) => {
          if (
            Math.abs(moveEvent.clientX - startX) > TAP_MOVE_THRESHOLD_PX ||
            Math.abs(moveEvent.clientY - startY) > TAP_MOVE_THRESHOLD_PX
          ) {
            ignoreClickRef.current = true;
          }
        };

        const handleEnd = () => {
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleEnd);
          window.removeEventListener('pointercancel', handleEnd);
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleEnd);
        window.addEventListener('pointercancel', handleEnd);
      }}
      onClick={() => {
        if (ignoreClickRef.current) return;
        onSelect();
      }}
    >
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
