import { useRef, useState, useEffect } from 'react';

/**
 * FAB(Floating Action Button)의 확장 상태를 관리하는 훅
 *
 * @description
 * 스크롤 위치에 따라 FAB의 확장/축소 상태를 자동으로 관리합니다.
 * 페이지 상단에 도달하면 FAB가 확장되고, 스크롤을 내리면 축소됩니다.
 *
 * @returns {Object} FAB 확장 관련 상태 및 참조 객체
 * @returns {boolean} isFabExtended - FAB의 현재 확장 상태
 * @returns {React.RefObject} sentinelRef - 스크롤 감지를 위한 sentinel 요소의 참조
 */
export function useFabExtension() {
  const [isFabExtended, setIsFabExtended] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsFabExtended(entries[0].isIntersecting);
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    isFabExtended,
    sentinelRef,
  };
}
