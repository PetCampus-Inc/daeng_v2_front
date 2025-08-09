import { useImperativeHandle, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useMapContext } from '../hooks/useMapContext';
import { useNaverMapSetEffect } from '../hooks/useNaverMapSetEffect';
import { Overlay as NaverOverlay } from '../utils/NaverOverlay';
import { useIsomorphicLayoutEffect } from '../utils/useIsomorphicLayoutEffect';

type OverlayOptions = {
  /**
   * 오버레이 좌표
   */
  position: {
    lat: number;
    lng: number;
  };

  /**
   * 오버레이 좌표 x축 오프셋
   */
  offsetX?: number;

  /**
   * 오버레이 좌표 y축 오프셋
   */
  offsetY?: number;

  /**
   * 오버레이 레이어 순서
   */
  zIndex?: number;

  /**
   * 오버레이 생성 후 호출되는 함수
   */
  onLoad?: (overlay: NaverOverlay) => void;
};

type OverlayProps = OverlayOptions & {
  ref?: React.RefObject<NaverOverlay>;
  children?: React.ReactNode;
};

export function Overlay({
  ref,
  children,
  position,
  offsetX,
  offsetY,
  zIndex,
  onLoad,
}: OverlayProps) {
  const map = useMapContext();

  const overlayPosition = useMemo(() => {
    return new naver.maps.LatLng(position.lat, position.lng);
  }, [position.lat, position.lng]);

  const overlay = useMemo(() => {
    const container = document.createElement('div');
    container.style.display = 'none';

    const overlay = new NaverOverlay({
      position: overlayPosition,
      content: container,
      offsetX,
      offsetY,
      zIndex,
      map,
    });

    return overlay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetX, offsetY]);

  useImperativeHandle(ref, () => overlay, [overlay]);

  useIsomorphicLayoutEffect(() => {
    onLoad?.(overlay);
  }, [overlay, onLoad]);

  useNaverMapSetEffect(overlay, 'setPosition', overlayPosition);
  useNaverMapSetEffect(overlay, 'setZIndex', zIndex);

  const target = useMemo(() => {
    const content = overlay.getContent() as HTMLElement | undefined;
    return content?.parentElement ?? null;
  }, [overlay]);

  return target ? ReactDOM.createPortal(children, target) : null;
}
