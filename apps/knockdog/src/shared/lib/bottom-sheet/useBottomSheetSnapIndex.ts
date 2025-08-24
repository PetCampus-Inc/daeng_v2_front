import { useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';

/**
 * 바텀시트 스냅포인트
 * 0: snapPoints[0]
 * 1: snapPoints[1]
 * 2: snapPoints[2]
 */
export type BottomSheetSnapIndex = 0 | 1 | 2;

/**
 * (home) 바텀시트 스냅포인트 인덱스를 전역으로 관리하는 훅
 */
export function useBottomSheetSnapIndex() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [snapIndex, setSnapIndex] = useQueryState('bottomSheetSnapIndex', {
    defaultValue: 0,
    parse: (value): BottomSheetSnapIndex => {
      const parsed = parseInt(value);
      return (parsed >= 0 && parsed <= 2 ? parsed : 0) as BottomSheetSnapIndex;
    },
    serialize: (value) => value.toString(),
    shallow: true,
  });

  // hydration mismatch 방지용
  if (!hasMounted) {
    return {
      snapIndex: 0 as BottomSheetSnapIndex,
      setSnapIndex: () => {},
      isCollapsed: true,
      isHalfExtended: false,
      isFullExtended: false,
    };
  }

  return {
    snapIndex,
    setSnapIndex,
    isCollapsed: snapIndex === 0,
    isHalfExtended: snapIndex === 1,
    isFullExtended: snapIndex === 2,
  };
}
