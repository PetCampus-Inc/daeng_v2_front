import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';

/**
 * 네이버 이벤트 타입
 * @see https://navermaps.github.io/maps.js.ncp/docs/mixins.list.html#toc5
 */
export type NaverEventType =
  | 'click'
  | 'dblclick'
  | 'rightclick'
  | 'mousedown'
  | 'mousemove'
  | 'mouseout'
  | 'mouseover'
  | 'mouseup'
  | 'drag'
  | 'dragstart'
  | 'dragend'
  | 'pinch'
  | 'pinchstart'
  | 'pinchend'
  | 'zoom_changed'
  | 'zoomstart'
  | 'zoomend'
  | 'bounds_changed'
  | 'center_changed'
  | 'idle'
  | 'init'
  | 'tilesloaded'
  | 'mapTypeId_changed';

export const useNaverEvent = <T extends object>(
  /**
   * 이벤트 대상 객체
   */
  target: T | undefined,
  /**
   * 이벤트 타입
   */
  type: NaverEventType,
  /**
   * 이벤트 핸들러
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: ((...args: any[]) => void) | undefined
) => {
  useIsomorphicLayoutEffect(() => {
    if (!target || !callback) return;

    const listener = naver.maps.Event.addListener(target, type, callback);

    return () => {
      naver.maps.Event.removeListener(listener);
    };
  }, [target, type, callback]);
};
