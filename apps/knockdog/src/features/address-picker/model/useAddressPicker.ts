'use client';

import { useEffect, useState } from 'react';

import { useDebounced } from '@shared/lib';
import { Address } from '@entities/address';

import { useSearchAddressQuery } from '../api/useSearchAddressQuery';
import { getGeocode } from '../api/searchAddress';
import { AddressSearchResult } from './address';

interface UseAddressPickerOptions {
  value?: string;
  onSelect?: (address: Address) => void;
}

const useAddressPicker = ({ value, onSelect }: UseAddressPickerOptions) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [isSelected, setIsSelected] = useState(false);

  const debouncedValue = useDebounced(inputValue, 200);
  const { data } = useSearchAddressQuery(debouncedValue);

  // 주소 선택 핸들러
  const handleSelect = (address: AddressSearchResult) => async () => {
    setIsSelected(true);
    setInputValue(address.roadAddress || address.address);

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

  // 검색어 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsSelected(false);
  };

  useEffect(() => {
    if (value) {
      setIsSelected(true);
      setInputValue(value);
    }
  }, [value]);

  return {
    addressList: data,
    inputValue,
    isSelected,
    handleSelect,
    handleChange,
  };
};

export { useAddressPicker };
