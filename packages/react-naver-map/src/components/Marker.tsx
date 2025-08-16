import React, { useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMapContext } from '../hooks/useMapContext';
import { useNaverEvent } from '../hooks/useNaverEvent';
import { useNaverMapSetEffect } from '../hooks/useNaverMapSetEffect';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';
import { getMarkerAnchorTransform, MarkerAnchor } from '../utils/getMarkerAnchorTransform';

type MarkerOptions = naver.maps.MarkerOptions & {
  /**
   * 마커의 모양입니다. (ReactNode 전용)
   */
  customIcon?: {
    /**
     * 마커의 아이콘으로 사용할 ReactNode 요소입니다.
     */
    content: React.ReactNode;

    /**
     * 지도 위에 놓이는 마커의 위치와 일치시킬 아이콘의 기준 위치입니다.
     * @default 'bottom-center'
     */
    align?: MarkerAnchor;

    /**
     * 정렬 기준점에서의 픽셀 오프셋.
     */
    offsetX?: number;
    offsetY?: number;
  };

  /**
   * 마커 생성 후에 호출되는 함수입니다.
   * @param marker 마커 인스턴스
   */
  onLoad?: (marker: naver.maps.Marker) => void;

  /**
   * 사용자가 마커에서 마우스 왼쪽 버튼을 클릭했을 때 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 버튼을 누르면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseDown?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 버튼을 놓으면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseUp?: (pointerEvent: naver.maps.PointerEvent) => void;
};

type MarkerProps = MarkerOptions & {
  ref?: React.RefObject<naver.maps.Marker>;
};

export function Marker({ ref, customIcon, onLoad, onClick, onMouseDown, onMouseUp, ...markerOptions }: MarkerProps) {
  const map = useMapContext();

  const container = useRef<HTMLDivElement | null>(
    typeof document !== 'undefined' ? document.createElement('div') : null
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const marker = useMemo(() => new naver.maps.Marker({ ...markerOptions }), []);

  const ReactIcon: naver.maps.HtmlIcon | undefined = useMemo(() => {
    if (customIcon && container.current) {
      return {
        content: container.current,
        anchor: naver.maps.Position.TOP_LEFT,
      } satisfies naver.maps.HtmlIcon;
    }
  }, [customIcon]);

  useImperativeHandle(ref, () => marker, [marker]);

  useIsomorphicLayoutEffect(() => {
    marker.setMap(map);
    return () => marker.setMap(null);
  }, [marker, map]);

  useEffect(() => {
    if (!marker) return;

    if (customIcon) {
      if (!ReactIcon) return;
      marker.setIcon(ReactIcon);
    }
  }, [marker, ReactIcon, customIcon]);

  useEffect(() => {
    onLoad?.(marker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marker]);

  useNaverMapSetEffect(marker, 'setAnimation', markerOptions.animation);
  useNaverMapSetEffect(marker, 'setClickable', markerOptions.clickable);
  useNaverMapSetEffect(marker, 'setCursor', markerOptions.cursor);
  useNaverMapSetEffect(marker, 'setDraggable', markerOptions.draggable);
  useNaverMapSetEffect(marker, 'setOptions', markerOptions);
  useNaverMapSetEffect(marker, 'setPosition', markerOptions.position);
  useNaverMapSetEffect(marker, 'setShape', markerOptions.shape);
  useNaverMapSetEffect(marker, 'setTitle', markerOptions.title);
  useNaverMapSetEffect(marker, 'setVisible', markerOptions.visible);
  useNaverMapSetEffect(marker, 'setZIndex', markerOptions.zIndex);

  useNaverEvent(marker, 'click', onClick);
  useNaverEvent(marker, 'mousedown', onMouseDown);
  useNaverEvent(marker, 'mouseup', onMouseUp);

  const align = customIcon?.align ?? 'bottom-center';
  const offsetX = customIcon?.offsetX ?? 0;
  const offsetY = customIcon?.offsetY ?? 0;
  const transform = getMarkerAnchorTransform(align, offsetX, offsetY);

  return (
    <>
      {customIcon && container.current
        ? createPortal(
            <div style={{ position: 'absolute', left: 0, top: 0, transform, willChange: 'transform' }}>
              {customIcon.content}
            </div>,
            container.current
          )
        : null}
    </>
  );
}
