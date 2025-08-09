import React, { useImperativeHandle, useMemo, useRef } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { useMapContext } from '../hooks/useMapContext';
import { useNaverEvent } from '../hooks/useNaverEvent';
import { useNaverMapSetEffect } from '../hooks/useNaverMapSetEffect';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';

type ReactIcon = {
  content: React.ReactNode;
  size?: {
    width: number;
    height: number;
  };
  anchor?:
    | {
        x: number;
        y: number;
      }
    | naver.maps.Position;
};

type MarkerOptions = naver.maps.MarkerOptions & {
  /**
   * 마커의 모양입니다. (ReactNode 전용)
   */
  content?: ReactIcon;

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

export function Marker({ ref, content, onLoad, onClick, onMouseDown, onMouseUp, ...markerOptions }: MarkerProps) {
  const map = useMapContext();

  const container = useRef<HTMLDivElement | null>(
    typeof document !== 'undefined' ? document.createElement('div') : null
  );
  const root = useRef<Root | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (container.current && !root.current) {
      root.current = createRoot(container.current);
    }
    return () => {
      root.current?.unmount();
      root.current = null;
    };
  }, []);

  const reactIcon = content ?? null;

  useIsomorphicLayoutEffect(() => {
    if (!root.current || !container.current) return;
    if (!reactIcon) {
      root.current.render(null);
      return;
    }

    root.current.render(<>{reactIcon.content}</>);
  }, [reactIcon]);

  const icon = useMemo(() => {
    if (reactIcon && container.current) {
      const htmlIcon: naver.maps.HtmlIcon = {
        content: container.current,
        size: reactIcon.size,
        anchor: reactIcon.anchor,
      };
      return htmlIcon;
    }
    return markerOptions.icon;
  }, [reactIcon, markerOptions.icon]);

  const marker = useMemo(
    () => new naver.maps.Marker({ ...markerOptions, icon }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useImperativeHandle(ref, () => marker, [marker]);

  useIsomorphicLayoutEffect(() => {
    marker.setMap(map);
    return () => marker.setMap(null);
  }, [marker, map]);

  useIsomorphicLayoutEffect(() => {
    if (onLoad) onLoad(marker);
  }, [marker, onLoad]);

  useNaverMapSetEffect(marker, 'setAnimation', markerOptions.animation);
  useNaverMapSetEffect(marker, 'setClickable', markerOptions.clickable);
  useNaverMapSetEffect(marker, 'setCursor', markerOptions.cursor);
  useNaverMapSetEffect(marker, 'setDraggable', markerOptions.draggable);
  useNaverMapSetEffect(marker, 'setIcon', icon);
  useNaverMapSetEffect(marker, 'setOptions', markerOptions);
  useNaverMapSetEffect(marker, 'setPosition', markerOptions.position);
  useNaverMapSetEffect(marker, 'setShape', markerOptions.shape);
  useNaverMapSetEffect(marker, 'setTitle', markerOptions.title);
  useNaverMapSetEffect(marker, 'setVisible', markerOptions.visible);
  useNaverMapSetEffect(marker, 'setZIndex', markerOptions.zIndex);

  useNaverEvent(marker, 'click', onClick);
  useNaverEvent(marker, 'mousedown', onMouseDown);
  useNaverEvent(marker, 'mouseup', onMouseUp);

  return null;
}
