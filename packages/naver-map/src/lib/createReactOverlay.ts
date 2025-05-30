import { ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { OverlayOptions } from '../types';
import { capitalize } from '../utils';

export interface ReactOverlayView extends naver.maps.OverlayView {
  /** 오버레이 레이어 순서 변경 */
  setZIndex(zIndex: number): void;
  /** 오버레이 컨텐츠 변경 */
  setContent(content: ReactNode): void;
  /** 오버레이 좌표 변경 */
  setPosition(position: naver.maps.LatLng): void;
  /** 오버레이 옵션 변경 */
  setOptions(options: OverlayOptions): void;
}

export interface ReactOverlayOptions {
  /** 네이버 지도 인스턴스 */
  navermaps: typeof naver.maps;
  /** 오버레이 옵션 */
  options: OverlayOptions;
}

/**
 * @description 네이버 지도의 오버레이 뷰를 구현한 함수형 팩토리
 * @see https://navermaps.github.io/maps.js.ncp/docs/naver.maps.OverlayView.html
 */
export function createReactOverlay({
  // content,
  navermaps,
  options,
}: ReactOverlayOptions) {
  const overlay = new navermaps.OverlayView() as ReactOverlayView;

  const element = document.createElement('div');
  element.style.position = 'absolute';

  let _position = options.position;
  let _root: Root | null = null;
  let _mounted = false;
  let _resizeObserver: ResizeObserver | null = null;

  overlay.onAdd = function () {
    // 오버레이 레이어에 엘리먼트 추가
    const overlayLayer = overlay.getPanes().floatPane;
    overlayLayer.appendChild(element);

    if (!_root && !_mounted) {
      _mounted = true;

      // 루트 컴포넌트 생성 및 랜더링
      _root = createRoot(element);
      _root.render(options.content);
    }
  };

  overlay.draw = function () {
    const projection = overlay.getProjection();
    if (!projection) return;

    // 좌표(lat, lng)를 픽셀 좌표(x, y)로 변환
    const pos = new navermaps.LatLng(_position);
    const pixelPosition = projection.fromCoordToOffset(pos);

    requestAnimationFrame(() => {
      element.style.left = `${pixelPosition.x}px`;
      element.style.top = `${pixelPosition.y}px`;
    });
  };

  overlay.onRemove = function () {
    // 리사이즈 옵저버 제거
    if (_resizeObserver) {
      _resizeObserver.disconnect();
      _resizeObserver = null;
    }

    // 오버레이 레이어에서 엘리먼트 제거
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }

    // 루트 컴포넌트 언마운트
    if (_mounted && _root) {
      const rootToUnmount = _root; // 참조 복사

      // 현재 렌더링 사이클 이후에 언마운트
      queueMicrotask(() => rootToUnmount.unmount());

      _root = null;
      _mounted = false;
    }
  };

  overlay.setContent = function (content: ReactNode) {
    if (!_root) return;
    _root.render(content);
  };

  overlay.setPosition = function (position: naver.maps.LatLng) {
    _position = position;
    overlay.draw();
  };

  overlay.setZIndex = function (zIndex: number) {
    element.style.zIndex = zIndex.toString();
  };

  overlay.setOptions = function (options: Partial<OverlayOptions>) {
    (Object.keys(options) as Array<keyof OverlayOptions>).forEach((key) => {
      const value = options[key];
      if (value === undefined) return;

      const methodName = `set${capitalize(key)}` as keyof ReactOverlayView;

      if (methodName in overlay && typeof overlay[methodName] === 'function') {
        (overlay[methodName] as Function)(value);
      }
    });
  };

  return overlay;
}
