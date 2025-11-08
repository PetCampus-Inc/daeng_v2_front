'use client';

import { useQuery } from '@tanstack/react-query';
import { getSafeAreaInsets } from './getSafeAreaInsets';
import type { SafeAreaInsets } from '@knockdog/bridge-core';

const DEFAULT_INSETS: SafeAreaInsets = { top: 0, bottom: 0, left: 0, right: 0 };

export function useSafeAreaInsets() {
  const { data } = useQuery({
    queryKey: ['safeAreaInsets'],
    queryFn: getSafeAreaInsets,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  return data ?? DEFAULT_INSETS;
}
