import { NAVER_MAP_ID } from '../constant';

export interface LoaderOptions {
  /**
   * 네이버 맵 클라이언트 ID
   */
  clientId: string;

  /**
   * 네이버 맵 스크립트 URL
   */
  url?: string;
}

export enum LoaderStatus {
  INITIAL,
  LOADING,
  LOADED,
  ERROR,
}

export type LoaderError = Event | string;

export class NaverMapLoader {
  private static instance: NaverMapLoader;
  private static loadCallbacks = new Set<(error?: LoaderError) => void>();

  public readonly clientId: string;
  public readonly url: string;
  private id = `${NAVER_MAP_ID}Loader__`;

  private callbacks: ((error?: LoaderError) => void)[] = [];
  private done = false;
  private loading = false;
  private error: LoaderError | undefined;

  /**
   * NaverMapLoader 인스턴스를 생성합니다.
   * 싱글톤 패턴으로 구현되어 있어 항상 동일한 인스턴스를 반환합니다.
   *
   * @param options
   */
  constructor({ clientId, url = '//openapi.map.naver.com/openapi/v3/maps.js' }: LoaderOptions) {
    this.clientId = clientId;
    this.url = url;

    if (!NaverMapLoader.instance) {
      NaverMapLoader.instance = this;
    }
    return NaverMapLoader.instance;
  }

  /**
   * 전역 로드 상태 리스너를 추가합니다.
   * Naver Map API가 이미 로드된 경우 즉시 콜백을 실행합니다.
   * 여러 컴포넌트에서 동시에 로드 상태를 감지할 때 사용됩니다.
   *
   * @param callback - 로드 완료/실패 시 실행될 콜백 함수
   */
  public static addLoadListener(callback: (error?: LoaderError) => void) {
    if (window.naver?.maps) {
      callback();
    } else {
      const interval = setInterval(() => {
        if (window.naver?.maps?.Map) {
          clearInterval(interval);
          callback();
        }
      }, 50);
    }
    NaverMapLoader.loadCallbacks.add(callback);
    return callback;
  }

  /**
   * 전역 로드 상태 리스너를 제거합니다.
   *
   * @param callback
   */
  public static removeLoadListener(callback: (error?: LoaderError) => void) {
    return NaverMapLoader.loadCallbacks.delete(callback);
  }

  /**
   * Naver Map API를 비동기적으로 로드합니다.
   */
  public load(): Promise<typeof naver> {
    return new Promise((resolve, reject) => {
      this.callbacks.push((error?: LoaderError) => {
        if (!error) {
          resolve(window.naver);
        } else {
          reject(error);
        }
      });
      this.execute();
    });
  }

  /**
   * 현재 로더의 상태를 반환합니다.
   */
  public get status(): LoaderStatus {
    if (this.error) {
      return LoaderStatus.ERROR;
    }
    if (this.done) {
      return LoaderStatus.LOADED;
    }
    if (this.loading) {
      return LoaderStatus.LOADING;
    }
    return LoaderStatus.INITIAL;
  }

  /**
   * Naver Map API 로드 실행을 관리합니다.
   * 이미 완료된 경우, API가 존재하는 경우, 새로 로드해야 하는 경우를 분기 처리합니다.
   */
  private execute() {
    if (this.done) {
      this.onScriptLoad();
    } else {
      if (window.naver && window.naver.maps) {
        this.onScriptLoad();
        return;
      }

      if (!this.loading) {
        this.loading = true;
        this.injectScript();
      }
    }
  }

  /**
   * script 태그를 DOM에 추가하여 Naver Map API를 로드합니다.
   * 중복 로드를 방지하기 위해 script ID를 확인합니다.
   */
  private injectScript() {
    if (document.getElementById(this.id)) {
      this.onScriptLoad();
      return;
    }

    const url = this.url + `?ncpKeyId=${this.clientId}`;
    const script = document.createElement('script');

    script.id = this.id;
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = this.onScriptLoad.bind(this);
    script.onerror = this.onScriptError.bind(this);

    document.head.appendChild(script);
  }

  /**
   * 스크립트 로드 실패 시 호출되는 에러 핸들러입니다.
   * 모든 대기 중인 콜백에 에러를 전파하고 상태를 정리합니다.
   *
   * @param error
   */
  private onScriptError(error: LoaderError): void {
    this.error = error;

    this.done = true;
    this.loading = false;

    this.callbacks.forEach((cb) => {
      cb(error);
    });
    this.callbacks = [];

    NaverMapLoader.loadCallbacks.forEach((cb) => {
      cb(error);
    });
  }

  /**
   * Naver Map API 로드 완료 시 호출되는 콜백 핸들러입니다.
   * jsContentLoaded 플래그가 활성화 된 경우 즉시 콜백을 실행하고,
   * 그렇지 않은 경우 onJSContentLoaded 이벤트에 콜백을 할당합니다.
   */
  private onScriptLoad() {
    const callback = () => {
      NaverMapLoader.instance.done = true;
      NaverMapLoader.instance.loading = false;

      NaverMapLoader.instance.callbacks.forEach((cb) => {
        cb();
      });
      NaverMapLoader.instance.callbacks = [];

      NaverMapLoader.loadCallbacks.forEach((cb) => {
        cb();
      });
    };

    if (window.naver && window.naver.maps) {
      if (window.naver.maps.jsContentLoaded) {
        callback();
      } else {
        window.naver.maps.onJSContentLoaded = callback;
      }
    }
  }
}
