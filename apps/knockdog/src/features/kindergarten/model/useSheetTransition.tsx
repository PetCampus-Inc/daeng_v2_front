import { useCallback, useState, useRef, useEffect } from 'react';

// 프레임 기반 지연 실행 유틸
function executeAfterFrames(callback: () => void, frameCount: number = 8) {
  let currentFrame = 0;

  function frameHandler() {
    currentFrame++;

    if (currentFrame >= frameCount) {
      callback();
    } else {
      requestAnimationFrame(frameHandler);
    }
  }

  requestAnimationFrame(frameHandler);
}

type SheetState =
  | 'none'
  | 'card'
  | 'card-expanding' // 카드가 확장 중 (snap point 1로 변경됨)
  | 'detail'
  | 'detail-closing'; // 디테일이 닫히는 중

interface UseSheetTransitionReturn {
  sheetState: SheetState;

  // 시트별 렌더링 제어
  shouldRenderCard: boolean;
  shouldRenderDetail: boolean;

  // 시트별 상태 제어
  cardSheetOpen: boolean;
  detailSheetOpen: boolean;

  // 애니메이션 제어
  cardShouldAnimate: boolean;
  detailShouldAnimate: boolean;

  // 액션
  openCardSheet: () => void;
  openDetailSheet: () => void;
  closeAllSheets: () => void;

  // 전환 핸들러
  handleCardExpansion: () => void; // 카드 snap point 1 도달 시
  handleDetailCloseStart: () => void; // 디테일 닫기 시작 시
  forceCloseDetail: () => void; // 디테일 강제 닫기
}

export function useSheetTransition(): UseSheetTransitionReturn {
  const [sheetState, setSheetState] = useState<SheetState>('none');

  // 기본 시트 열기 액션
  const openDetailSheet = useCallback(() => {
    setSheetState('detail');
  }, []);

  const openCardSheet = useCallback(() => {
    setSheetState('card');
  }, []);

  const closeAllSheets = useCallback(() => {
    // 전환 중에는 닫기 방지
    if (sheetState === 'card-expanding' || sheetState === 'detail-closing') {
      return;
    }

    setSheetState('none');
  }, [sheetState]);

  // 전환 핸들러 - snap point 애니메이션 완료 후 전환
  const handleCardExpansion = useCallback(() => {
    if (sheetState !== 'card') return;

    // snap point 애니메이션 완료 대기 (18프레임 = 약 300ms)
    executeAfterFrames(() => {
      // 디테일 열기 + 카드 닫기 (동시 전환)
      setSheetState('card-expanding');

      // 8프레임 후 detail 상태로 정리
      executeAfterFrames(() => {
        setSheetState('detail');
      }, 8);
    }, 18);
  }, [sheetState]);

  const handleDetailCloseStart = useCallback(() => {
    if (sheetState !== 'detail') return;

    setSheetState('detail-closing');

    // 8프레임 후 카드시트 표시
    executeAfterFrames(() => {
      setSheetState('card');
    }, 8);
  }, [sheetState]);

  // 비상 상황 핸들러 - onTransitionStart가 호출되지 않을 때 사용
  const forceCloseDetail = useCallback(() => {
    if (sheetState === 'detail') {
      setSheetState('card');
    } else {
      setSheetState('none');
    }
  }, [sheetState]);

  // 상태에 따른 렌더링 제어
  const shouldRenderCard = sheetState === 'card' || sheetState === 'card-expanding' || sheetState === 'detail-closing';
  const shouldRenderDetail =
    sheetState === 'detail' || sheetState === 'card-expanding' || sheetState === 'detail-closing';

  // 시트 open 상태 제어
  const cardSheetOpen = sheetState === 'card';
  const detailSheetOpen = sheetState === 'detail' || sheetState === 'card-expanding' || sheetState === 'detail-closing';

  // 이전 상태 추적
  const prevSheetStateRef = useRef<SheetState>('none');
  useEffect(() => {
    prevSheetStateRef.current = sheetState;
  }, [sheetState]);

  // 애니메이션 제어
  // 카드: detail-closing에서 돌아올 때만 애니메이션 (처음 열릴 때는 애니메이션)
  const cardShouldAnimate = sheetState === 'card' && prevSheetStateRef.current !== 'card-expanding';

  // 디테일: 처음 열릴 때는 애니메이션 없음 (card-expanding에서 전환), 닫힐 때는 애니메이션
  const detailShouldAnimate = sheetState === 'detail' && prevSheetStateRef.current !== 'card-expanding';

  return {
    sheetState,

    // 렌더링 제어
    shouldRenderCard,
    shouldRenderDetail,

    // 상태 제어
    cardSheetOpen,
    detailSheetOpen,

    // 애니메이션 제어
    cardShouldAnimate,
    detailShouldAnimate,

    // 액션
    openCardSheet,
    openDetailSheet,
    closeAllSheets,

    // 전환 핸들러
    handleCardExpansion,
    handleDetailCloseStart,
    forceCloseDetail,
  };
}
