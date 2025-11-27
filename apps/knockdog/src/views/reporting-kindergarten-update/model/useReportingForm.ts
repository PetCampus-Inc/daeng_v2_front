import { useState, useMemo, useCallback, useEffect } from 'react';
import { checkOptions } from './checkOptions';
import type { WebImageAsset } from '@shared/lib/media';

type CheckedKey = (typeof checkOptions)[number]['key'];

interface FilesByType {
  closed: WebImageAsset[];
  price: WebImageAsset[];
  phone: WebImageAsset[];
  time: WebImageAsset[];
}

interface UseReportingFormReturn {
  checkedSet: Set<CheckedKey>;
  checkedList: CheckedKey[];
  isChecked: (key: CheckedKey) => boolean;
  toggleCheck: (key: CheckedKey, checked: boolean) => void;
  newAddress: string | null | undefined;
  setNewAddress: (address: string | null | undefined) => void;
  files: FilesByType;
  setFiles: (key: keyof FilesByType, files: WebImageAsset[]) => void;
  reportingParams: Record<string, any>;
  isFormValid: boolean;
}

export function useReportingForm(): UseReportingFormReturn {
  const [checkedSet, setCheckedSet] = useState<Set<CheckedKey>>(new Set());
  const [newAddress, setNewAddress] = useState<string | null>();
  const [files, setFilesState] = useState<FilesByType>({
    closed: [],
    price: [],
    phone: [],
    time: [],
  });

  const checkedList = useMemo(() => Array.from(checkedSet), [checkedSet]);

  const isChecked = (key: CheckedKey) => checkedSet.has(key);

  const toggleCheck = useCallback((key: CheckedKey, checked: boolean) => {
    setCheckedSet((prev) => {
      const next = new Set(prev);
      checked ? next.add(key) : next.delete(key);
      return next;
    });
  }, []);

  const setFiles = useCallback((key: keyof FilesByType, newFiles: WebImageAsset[]) => {
    setFilesState((prev) => ({ ...prev, [key]: newFiles }));
  }, []);

  const reportingParams = useMemo(() => {
    const params: Record<string, any> = {};

    if (checkedSet.has('closed') && files.closed.length) {
      params.businessChange = files.closed.map((asset) => asset.key);
    }
    if (checkedSet.has('price') && files.price.length) {
      params.priceChange = files.price.map((asset) => asset.key);
    }
    if (checkedSet.has('phone') && files.phone.length) {
      params.phoneChange = files.phone.map((asset) => asset.key);
    }
    if (checkedSet.has('time') && files.time.length) {
      params.hoursChange = files.time.map((asset) => asset.key);
    }
    if (checkedSet.has('address') && newAddress?.trim()) {
      params.address = newAddress;
    }

    return params;
  }, [checkedSet, newAddress, files]);

  const isFormValid = useMemo(() => {
    if (checkedList.length === 0) return false;

    return checkedList.every((key) => {
      if (key === 'address') return newAddress?.trim();
      if (key === 'closed') return files.closed.length > 0;
      if (key === 'price') return files.price.length > 0;
      if (key === 'phone') return files.phone.length > 0;
      if (key === 'time') return files.time.length > 0;
      return true;
    });
  }, [checkedList, newAddress, files]);

  return {
    checkedSet,
    checkedList,
    isChecked,
    toggleCheck,
    newAddress,
    setNewAddress,
    files,
    setFiles,
    reportingParams,
    isFormValid,
  };
}
