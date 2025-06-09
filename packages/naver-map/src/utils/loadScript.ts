import _loadScript from 'load-script';

let loadingPromise: Promise<typeof naver.maps> | null = null;

export async function loadNavermapsScript(
  clientId: string
): Promise<typeof naver.maps> {
  // 이미 로드된 네이버 맵이 있다면 바로 반환
  if (typeof window !== 'undefined' && window.naver?.maps) {
    if (window.naver.maps.jsContentLoaded) {
      return window.naver.maps;
    }
  }

  // 로딩 중인 경우 해당 Promise 반환
  if (loadingPromise) {
    return loadingPromise;
  }

  const url = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;

  loadingPromise = (async () => {
    try {
      await loadScript(url);

      const navermaps = window.naver.maps;

      // 이미 로드 완료된 경우
      if (navermaps.jsContentLoaded) {
        return navermaps;
      }

      // 스크립트 로드 완료 대기
      return await Promise.race([
        new Promise<typeof naver.maps>((resolve) => {
          navermaps.onJSContentLoaded = () => resolve(navermaps);
        }),

        new Promise<typeof naver.maps>((resolve, reject) => {
          setTimeout(() => {
            if (window.naver?.maps) resolve(window.naver.maps);
            else reject(new Error('[Timeout] 네이버 맵 로딩에 실패했습니다.'));
          }, 2000);
        }),
      ]);
    } catch (error) {
      loadingPromise = null;
      throw error;
    }
  })();

  return loadingPromise;
}

export function loadScript(src: string): Promise<HTMLScriptElement> {
  return new Promise((resolve, reject) => {
    _loadScript(src, (err, script) => {
      if (err) reject(err);
      else resolve(script);
    });
  });
}
