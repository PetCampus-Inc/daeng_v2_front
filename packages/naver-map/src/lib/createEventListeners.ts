const EVENT_MAP = {
  onClick: 'click',
  onTap: 'tap',
  onZoomChanged: 'zoom_changed',
  onDragStart: 'dragstart',
  onDragEnd: 'dragend',
} as const;

/**
 * props에서 naver.maps 이벤트 핸들러만 필터링하고 이벤트 리스너를 생성 및 반환합니다.
 *
 * @param target - 이벤트를 등록할 대상
 * @param props - 이벤트 핸들러가 정의된 객체
 * @returns 이벤트 리스너 배열
 */
export function createEventListeners(
  target: naver.maps.Map | naver.maps.OverlayView | naver.maps.Marker,
  props: Record<string, any>
) {
  // props에서 EVENT_MAP에 정의된 이벤트 핸들러만 필터링
  const eventHandlers = Object.entries(props).filter(
    ([key, value]) =>
      key.startsWith('on') &&
      typeof value === 'function' &&
      Object.keys(EVENT_MAP).includes(key)
  );

  return eventHandlers
    .map(([eventName, listener]) => {
      return naver.maps.Event.addListener(
        target,
        EVENT_MAP[eventName as keyof typeof EVENT_MAP],
        listener
      );
    })
    .filter(
      (listener): listener is naver.maps.MapEventListener =>
        listener !== undefined
    );
}
