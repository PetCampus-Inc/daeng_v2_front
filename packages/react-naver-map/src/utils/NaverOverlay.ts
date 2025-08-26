export interface OverlayOptions {
  /**
   * 오버레이 컨텐츠로 사용할 래퍼 요소
   */
  content?: HTMLElement;

  /**
   * 오버레이 좌표
   */
  position: naver.maps.LatLng | naver.maps.CoordLiteral;

  /**
   * 오버레이가 올라갈 지도
   */
  map?: naver.maps.Map | null;

  /**
   * 오버레이의 z-index
   */
  zIndex?: number;

  /**
   * 오버레이의 x 오프셋
   */
  offsetX?: number;

  /**
   * 오버레이의 y 오프셋
   */
  offsetY?: number;
}

export class Overlay {
  private element: HTMLDivElement;
  private mounted = false;

  private position!: naver.maps.LatLng | naver.maps.CoordLiteral;
  private readonly overlayView: naver.maps.OverlayView;
  private options: OverlayOptions;

  /**
   * 주어진 객체로 오버레이를 생성한다.
   * @param options
   */
  constructor(options: OverlayOptions) {
    this.options = options;

    this.element = document.createElement('div');
    this.element.style.position = 'absolute';

    this.overlayView = new naver.maps.OverlayView();
    this.overlayView.onAdd = this.onAdd;
    this.overlayView.draw = this.draw;
    this.overlayView.onRemove = this.onRemove;

    this.setPosition(options.position);
    if (typeof options.zIndex === 'number') this.setZIndex(options.zIndex);
    if (options.content) this.setContent(options.content);
    this.setMap(options.map ?? null);
  }

  /**
   * 오버레이를 지도에 추가합니다.
   * 인수로 null을 전달하면 오버레이를 지도에서 제거합니다.
   *
   * @param map
   */
  public setMap(map: naver.maps.Map | null) {
    this.overlayView.setMap(map);
  }

  /**
   * 현재 오버레이가 추가된 Map 객체를 반환합니다.
   */
  public getMap(): naver.maps.Map | null {
    return this.overlayView.getMap();
  }

  /**
   * 오버레이의 좌표를 설정합니다.
   *
   * @param position
   */
  public setPosition(position: naver.maps.LatLng | naver.maps.CoordLiteral) {
    this.position = position;
    this.draw();
  }

  /**
   * 오버레이의 좌표를 반환합니다.
   */
  public getPosition(): naver.maps.LatLng {
    return this.position instanceof naver.maps.LatLng
      ? this.position
      : new naver.maps.LatLng(this.position as naver.maps.CoordLiteral);
  }

  /**
   * 오버레이 컨텐츠(래퍼 요소)를 설정합니다.
   *
   * @param content
   */
  public setContent(content: HTMLElement) {
    this.options.content = content;
    this.element.innerHTML = '';
    this.element.appendChild(content);
  }

  /**
   * 오버레이 컨텐츠(래퍼 요소)를 반환합니다.
   */
  public getContent(): HTMLElement | undefined {
    return this.options.content;
  }

  /**
   * 오버레이의 z-index를 설정합니다.
   *
   * @param zIndex
   */
  public setZIndex(zIndex: number) {
    this.element.style.zIndex = String(zIndex);
  }

  /**
   * 오버레이의 z-index를 반환합니다.
   */
  public getZIndex(): number {
    const v = Number(this.element.style.zIndex);
    return Number.isNaN(v) ? 0 : v;
  }

  /**
   * 지도에 오버레이를 그릴 때 호출됩니다.
   */
  private draw = () => {
    if (!this.getMap()) return;
    const projection = this.getProjection();
    if (!projection) return;

    const pos =
      this.position instanceof naver.maps.LatLng
        ? this.position
        : new naver.maps.LatLng(this.position as naver.maps.CoordLiteral);

    const pixel = projection.fromCoordToOffset(pos);
    const x = pixel.x + (this.options.offsetX ?? 0);
    const y = pixel.y + (this.options.offsetY ?? 0);

    requestAnimationFrame(() => {
      this.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.element.style.willChange = 'transform';
    });
  };

  /**
   * 오버레이 요소를 추가할 수 있는 지도의 창(pane) 요소 집합 객체를 반환합니다.
   */
  private getPanes(): naver.maps.MapPanes {
    return this.overlayView.getPanes();
  }

  /**
   * 지도 좌표, 화면 좌표 간에 변환할 수 있는 {@link naver.maps.MapSystemProjection} 객체를 반환합니다.
   * 반환된 객체를 이용해 지도 위의 원하는 위치에 오버레이를 배치할 수 있습니다.
   */
  private getProjection(): naver.maps.MapSystemProjection | null {
    return this.overlayView.getProjection();
  }

  /**
   * 지도에 오버레이를 추가할 때 호출됩니다.
   */
  private onAdd = () => {
    const overlayLayer = this.getPanes().overlayLayer;
    overlayLayer.appendChild(this.element);

    if (!this.mounted) {
      this.mounted = true;
      if (this.options.content && !this.options.content.parentElement) {
        this.element.appendChild(this.options.content);
      }
    }
  };

  /**
   * 지도에서 오버레이를 제거할 때 호출됩니다.
   */
  private onRemove = () => {
    if (this.element.parentNode) this.element.parentNode.removeChild(this.element);
    this.mounted = false;
  };
}
