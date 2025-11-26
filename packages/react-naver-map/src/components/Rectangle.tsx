import { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useMapContext } from '../hooks/useMapContext';
import { useNaverEvent } from '../hooks/useNaverEvent';
import { useNaverMapSetEffect } from '../hooks/useNaverMapSetEffect';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';

type RectangleOptions = naver.maps.RectangleOptions & {
  /**
   * 사각형 생성 후에 호출되는 함수입니다.
   * @param rectangle 사각형 인스턴스
   */
  onLoad?: (rectangle: naver.maps.Rectangle) => void;

  /**
   * 사용자가 사각형에서 마우스 왼쪽 버튼을 클릭했을 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 사각형에서 마우스 왼쪽 버튼을 더블 클릭했을 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onDoubleClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 사각형에서 마우스 버튼을 누를 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseDown?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자의 마우스 포인터가 사각형의 경계를 벗어날 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseOut?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자의 마우스 포인터가 사각형의 경계에 들어올 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseOver?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 사각형에서 마우스 버튼을 놓을 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseUp?: (pointerEvent: naver.maps.PointerEvent) => void;
};

type RectangleProps = RectangleOptions & {
  ref?: React.RefObject<naver.maps.Rectangle>;
};

export function Rectangle({
  ref,
  onLoad,
  onClick,
  onDoubleClick,
  onMouseDown,
  onMouseOut,
  onMouseOver,
  onMouseUp,
  ...rectangleOptions
}: RectangleProps) {
  const map = useMapContext();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rectangle = useMemo(() => new naver.maps.Rectangle({ ...rectangleOptions }), []);

  useImperativeHandle(ref, () => rectangle, [rectangle]);

  useIsomorphicLayoutEffect(() => {
    rectangle.setMap(map);
    return () => rectangle.setMap(null);
  }, [rectangle, map]);

  useEffect(() => {
    onLoad?.(rectangle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rectangle]);

  useNaverMapSetEffect(rectangle, 'setOptions', rectangleOptions);
  useNaverMapSetEffect(rectangle, 'setBounds', rectangleOptions.bounds);
  useNaverMapSetEffect(rectangle, 'setClickable', rectangleOptions.clickable);
  useNaverMapSetEffect(rectangle, 'setVisible', rectangleOptions.visible);
  useNaverMapSetEffect(rectangle, 'setZIndex', rectangleOptions.zIndex);

  useNaverEvent(rectangle, 'click', onClick);
  useNaverEvent(rectangle, 'dblclick', onDoubleClick);
  useNaverEvent(rectangle, 'mousedown', onMouseDown);
  useNaverEvent(rectangle, 'mouseout', onMouseOut);
  useNaverEvent(rectangle, 'mouseover', onMouseOver);
  useNaverEvent(rectangle, 'mouseup', onMouseUp);

  return null;
}
