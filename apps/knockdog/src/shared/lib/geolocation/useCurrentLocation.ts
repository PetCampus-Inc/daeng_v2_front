'use client';

import { useEffect, useState } from 'react';
import { useBridge } from '@shared/lib/bridge';
import { BridgeException, METHODS } from '@knockdog/bridge-core';

type Location = { lat: number; lng: number };
type Options = {
  prefer?: 'auto' | 'native' | 'web'; // 네이티브 우선 여부
  timeoutMs?: number; // 네이티브 요청 타임아웃
  highAccuracy?: boolean; // 웹 풀백시 highAccuracy 여부
};

function isNativeWebView() {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

export function useCurrentLocation(options?: Options) {
  const prefer = options?.prefer ?? 'auto';

  const [position, setPosition] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bridge = useBridge();

  useEffect(() => {
    let mounted = true;

    async function getFromNative() {
      try {
        const res = await bridge.request<Location>(METHODS.getLatLng);

        if (mounted) {
          setPosition(res);
        }
        return true;
      } catch (e: unknown) {
        if (e instanceof BridgeException) {
          const code = e?.code;
          const message = e?.message || String(e);
          if (code === 'EPERMISSION') {
            if (mounted) {
              setError(message);
            }
            return false;
          }
        }

        const msg = typeof e === 'string' ? e : ((e as any)?.message ?? String(e));
        if (mounted) setError(msg);
        return null;
      }
    }

    function getFromWeb() {
      return new Promise<boolean>((resolve) => {
        if (typeof window === 'undefined' || !('geolocation' in window.navigator)) {
          if (mounted) {
            setError('현재 환경에서는 위치 정보를 가져올 수 없습니다.');
          }
          resolve(false);
          return;
        }

        const anyNavigator = window.navigator as Navigator & {
          permissions?: { query?: (p: { name: 'geolocation' }) => Promise<PermissionStatus> };
        };
        const callGetCurrentPosition = () => {
          window.navigator.geolocation.getCurrentPosition(
            (position) => {
              if (mounted) {
                setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
              }
              resolve(true);
            },
            (err) => {
              if (mounted) {
                setError(err.message);
              }
              resolve(false);
            },
            {
              timeout: 10_000,
              maximumAge: 300_000,
              enableHighAccuracy: !!options?.highAccuracy,
            }
          );
        };
        if (anyNavigator.permissions?.query) {
          anyNavigator.permissions
            .query({ name: 'geolocation' })
            .then((status) => {
              if (status.state === 'denied') {
                if (mounted) {
                  setError('위치 권한이 거부되었습니다. (Web)');
                }
                resolve(false);
              } else {
                callGetCurrentPosition();
              }
            })
            .catch((error) => {
              callGetCurrentPosition();
            });
        } else {
          callGetCurrentPosition();
        }
      });
    }

    (async () => {
      setLoading(true);
      setError(null);

      const isNative = isNativeWebView();
      const canUseSecureWeb = typeof window !== 'undefined' && window.isSecureContext;

      if (prefer === 'web' || (!isNative && prefer !== 'native')) {
        await getFromWeb();
      } else {
        const nativeResult = await getFromNative();

        if (nativeResult === null && canUseSecureWeb) {
          await getFromWeb();
        }
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [prefer, bridge, options?.highAccuracy]);

  return { position, loading, error };
}
