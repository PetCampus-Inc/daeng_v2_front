export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function getCurrentLocation(opts?: GeolocationOptions): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation_unavailable'));
      return;
    }

    const options = {
      timeout: 10000,
      maximumAge: 300000, // 5분
      enableHighAccuracy: false,
      ...opts,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.warn('위치 정보를 가져올 수 없습니다:', err.message);
        reject(err);
      },
      options
    );
  });
}
