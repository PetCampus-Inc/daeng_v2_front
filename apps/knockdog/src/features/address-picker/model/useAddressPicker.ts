'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { useDebounced } from '@shared/lib';
import { Address } from '@entities/address';

import { useSearchAddressQuery } from '../api/useSearchAddressQuery';
import { getGeocode } from '../api/searchAddress';
import { AddressSearchResult } from './address';

interface UseAddressPickerOptions {
  value?: string;
  onSelect?: (address: Address) => void;
  onClear?: () => void;
  /** 선택 후 재포커스 시 입력 삭제 + 이전 주소로 목록 재표시, 목록 선택만 반영 */
  clearOnReselect?: boolean;
}

const useAddressPicker = ({
  value,
  onSelect,
  onClear,
  clearOnReselect = false,
}: UseAddressPickerOptions) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSelected, setIsSelected] = useState(false);
  const isSelectedRef = useRef(isSelected);
  const isListInteractingRef = useRef(false);
  const listInteractionEndTimerRef = useRef<number | null>(null);

  isSelectedRef.current = isSelected;

  const debouncedValue = useDebounced(searchQuery, 200);
  const { data } = useSearchAddressQuery(debouncedValue);

  // 주소 선택 핸들러 — 목록 항목만 폼에 반영
  const handleSelect = (address: AddressSearchResult) => async () => {
    const selectedAddress = address.roadAddress || address.address;

    setIsSelected(true);
    setInputValue(selectedAddress);
    setSearchQuery(selectedAddress);

    let lat = 0;
    let lng = 0;

    try {
      const coordinates = await getGeocode(address.address);
      lat = coordinates.lat;
      lng = coordinates.lng;
    } catch (error) {
      console.error('[useAddressPicker] geocode failed:', error);
    }

    onSelect?.({ ...address, lat, lng });
  };

  // 검색어 변경 핸들러 — 타이핑은 검색만, 폼 반영은 목록 선택 시에만
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setInputValue(next);
    setSearchQuery(next);
    setIsSelected(false);
  };

  /** 선택 후 다시 누르면 입력 삭제 + 이전 주소로 목록 유지 (부모 value는 유지) */
  const handleFocus = () => {
    if (!clearOnReselect || !isSelected) return;

    const previous = inputValue;
    setIsSelected(false);
    setInputValue('');
    setSearchQuery(previous);
  };

  /** 결과 리스트 터치/스크롤 중에는 blur로 검색어를 지우지 않음 */
  const markListInteraction = () => {
    isListInteractingRef.current = true;
    if (listInteractionEndTimerRef.current != null) {
      window.clearTimeout(listInteractionEndTimerRef.current);
      listInteractionEndTimerRef.current = null;
    }
  };

  const endListInteraction = () => {
    if (listInteractionEndTimerRef.current != null) {
      window.clearTimeout(listInteractionEndTimerRef.current);
    }
    listInteractionEndTimerRef.current = window.setTimeout(() => {
      listInteractionEndTimerRef.current = null;
      isListInteractingRef.current = false;
    }, 300);
  };

  /** 목록 바깥 클릭 시 미선택이면 기존 value로 복원 */
  const handleBlur = () => {
    window.setTimeout(() => {
      if (isListInteractingRef.current) return;
      if (!clearOnReselect) return;
      if (isSelectedRef.current) return;

      const restored = value ?? '';
      setInputValue(restored);
      setSearchQuery(restored);
      setIsSelected(!!restored);
    }, 180);
  };

  const handleClear = () => {
    setInputValue('');
    setSearchQuery('');
    setIsSelected(false);
  };

  useEffect(() => {
    if (value) {
      setIsSelected(true);
      setInputValue(value);
      setSearchQuery(value);
      return;
    }

    setIsSelected(false);
    setInputValue('');
  }, [value]);

  useEffect(() => {
    return () => {
      if (listInteractionEndTimerRef.current != null) {
        window.clearTimeout(listInteractionEndTimerRef.current);
      }
    };
  }, []);

  return {
    addressList: data,
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
  };
};

export { useAddressPicker };
