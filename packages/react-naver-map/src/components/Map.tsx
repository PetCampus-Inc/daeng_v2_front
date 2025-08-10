import { useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { MapProvider } from '../hooks/useMapContext';
import { useNaverEvent } from '../hooks/useNaverEvent';
import { useNaverMapSetEffect } from '../hooks/useNaverMapSetEffect';
import { NaverMapLoader } from '../utils/NaverMapLoader';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';
import { NAVER_MAP_ID } from '../constant';

type MapOptions = naver.maps.MapOptions & {
  /**
   * 지도의 초기 중심 좌표입니다.
   */
  center: {
    lat: number;
    lng: number;
  };

  /**
   * 지도의 중심을 이동시킬 때 Panto를 사용할지 여부입니다.
   * @default false
   */
  isPanto?: boolean;

  /**
   * 이동 효과에 사용할 옵션입니다.
   * @default { duration: 350, easing: 'easeOutCubic' }
   */
  transitionOptions?: {
    duration?: number;
    easing?: 'linear' | 'easeOutCubic' | 'easeInOutCubic';
  };

  /**
   * 지도 생성 후에 호출되는 함수입니다.
   * @param map 지도 인스턴스
   */
  onLoad?: (map: naver.maps.Map) => void;

  /**
   * 사용자가 지도에서 마우스 왼쪽 버튼을 클릭하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 왼쪽 버튼을 더블 클릭하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onDoubleClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 오른쪽 버튼을 클릭하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onRightClick?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도를 끌어다 놓으면(드래그) 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onDrag?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 드래그를 시작하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onDragStart?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 드래그를 종료하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onDragEnd?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 버튼을 누르면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseDown?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 지도에서 사용자의 마우스 포인터를 움직이면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseMove?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자의 마우스 포인터가 지도 경계를 벗어나면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseOut?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자의 마우스 포인터가 지도 경계에 들어오면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseOver?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 마우스 버튼을 놓으면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onMouseUp?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 두 손가락으로 지도를 누르고 두 손가락을 모으거나 펼치면(핀치 제스처) 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onPinch?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 핀치 제스처를 시작하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onPinchStart?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 사용자가 지도에서 핀치 제스처를 종료하면 이벤트가 발생합니다.
   * @param pointerEvent 포인터 이벤트 객체
   */
  onPinchEnd?: (pointerEvent: naver.maps.PointerEvent) => void;

  /**
   * 지도 줌 레벨이 변경되면 이벤트가 발생합니다.
   * @param zoom 변경된 줌 레벨
   */
  onZoomChanged?: (zoom: number) => void;

  /**
   * 지도 줌 효과가 시작되면 이벤트가 발생합니다.
   */
  onZoomStart?: () => void;

  /**
   * 지도 줌 레벨이 종료되면 이벤트가 발생합니다.
   */
  onZoomEnd?: () => void;

  /**
   * 지도 좌표 경계가 변경되면 이벤트가 발생합니다.
   * @param bounds 변경된 좌표 경계
   */
  onBoundsChanged?: (bounds: naver.maps.Bounds) => void;

  /**
   * 지도 중심 좌표가 변경되면 이벤트가 발생합니다.
   * @param center 변경된 중심 좌표
   */
  onCenterChanged?: (center: naver.maps.Coord) => void;

  /**
   * 지도가 초기화되면 이벤트가 발생합니다.
   */
  onInit?: () => void;

  /**
   * 지도의 움직임이 종료되면(유휴 상태) 이벤트가 발생합니다.
   */
  onIdle?: () => void;

  /**
   * 지도의 모든 타일이 로드되면 이벤트가 발생합니다.
   */
  onTileLoaded?: () => void;

  /**
   * 지도 유형 id가 변경되면 이벤트가 발생합니다.
   * @param mapTypeId 변경된 지도 유형의 id
   */
  onMapTypeIdChanged?: (mapTypeId: naver.maps.MapTypeId | string) => void;
};

type MapProps = MapOptions & {
  ref?: React.RefObject<naver.maps.Map | null>;
  children?: React.ReactNode;
  id?: string;
  className?: string;
};

export function Map({
  ref,
  id,
  children,
  className,
  center,
  isPanto = false,
  transitionOptions = {
    duration: 350,
    easing: 'easeOutCubic',
  },
  onLoad,
  onClick,
  onDoubleClick,
  onRightClick,
  onMouseOut,
  onMouseDown,
  onMouseOver,
  onMouseUp,
  onMouseMove,
  onDragStart,
  onDrag,
  onDragEnd,
  onPinch,
  onPinchStart,
  onPinchEnd,
  onZoomChanged,
  onZoomStart,
  onZoomEnd,
  onBoundsChanged,
  onCenterChanged,
  onInit,
  onIdle,
  onTileLoaded,
  onMapTypeIdChanged,
  ...mapOptions
}: MapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [map, setMap] = useState<naver.maps.Map>();
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const callback = NaverMapLoader.addLoadListener((error) => setIsLoaded(!error));
    return () => {
      NaverMapLoader.removeLoadListener(callback);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!isLoaded) return;

    const mapDiv = container.current;
    if (!mapDiv) return;

    const naverMap = new naver.maps.Map(mapDiv, mapOptions);

    setMap(naverMap);

    return () => {
      mapDiv.innerHTML = '';
    };
  }, [isLoaded]);

  useIsomorphicLayoutEffect(() => {
    if (!map) return;

    const originalPanTo = map.panTo.bind(map);
    map.panTo = (coord: naver.maps.Coord, options?: naver.maps.TransitionOptions) => {
      return originalPanTo(coord, { ...transitionOptions, ...options });
    };
  }, [map, transitionOptions.duration, transitionOptions.easing]);

  useImperativeHandle(ref, () => map!, [map]);

  useIsomorphicLayoutEffect(() => {
    if (!map) return;
    onLoad?.(map);
  }, [map]);

  useIsomorphicLayoutEffect(() => {
    if (!map) return;

    const prevCenter = map.getCenter();
    const newCenter = new naver.maps.LatLng(center);

    if (prevCenter.equals(newCenter)) return;

    if (isPanto) {
      map.panTo(newCenter);
    } else {
      map.setCenter(newCenter);
    }
  }, [map, center.lat, center.lng]);

  useNaverMapSetEffect(map, 'setZoom', mapOptions.zoom);
  useNaverMapSetEffect(map, 'setMapTypeId', mapOptions.mapTypeId);

  useNaverEvent(map, 'click', onClick);
  useNaverEvent(map, 'dblclick', onDoubleClick);
  useNaverEvent(map, 'rightclick', onRightClick);
  useNaverEvent(map, 'mousedown', onMouseDown);
  useNaverEvent(map, 'mousemove', onMouseMove);
  useNaverEvent(map, 'mouseout', onMouseOut);
  useNaverEvent(map, 'mouseover', onMouseOver);
  useNaverEvent(map, 'mouseup', onMouseUp);
  useNaverEvent(map, 'drag', onDrag);
  useNaverEvent(map, 'dragstart', onDragStart);
  useNaverEvent(map, 'dragend', onDragEnd);
  useNaverEvent(map, 'pinch', onPinch);
  useNaverEvent(map, 'pinchstart', onPinchStart);
  useNaverEvent(map, 'pinchend', onPinchEnd);
  useNaverEvent(map, 'zoom_changed', onZoomChanged);
  useNaverEvent(map, 'zoomstart', onZoomStart);
  useNaverEvent(map, 'zoomend', onZoomEnd);
  useNaverEvent(map, 'bounds_changed', onBoundsChanged);
  useNaverEvent(map, 'center_changed', onCenterChanged);
  useNaverEvent(map, 'init', onInit);
  useNaverEvent(map, 'idle', onIdle);
  useNaverEvent(map, 'tilesloaded', onTileLoaded);
  useNaverEvent(map, 'mapTypeId_changed', onMapTypeIdChanged);

  return (
    <>
      <div ref={container} id={id || `${NAVER_MAP_ID}map__`} className={className} />
      {map && <MapProvider value={map}>{children}</MapProvider>}
    </>
  );
}
