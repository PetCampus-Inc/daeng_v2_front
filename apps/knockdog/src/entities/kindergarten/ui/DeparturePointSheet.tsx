// FIXME: fsd 원칙에 맞는지 논의 필요

import { Icon, RadioGroup, RadioGroupItem } from '@knockdog/ui';
import { useState, useEffect, useCallback } from 'react';
import { METHODS } from '@knockdog/bridge-core';
import { BottomSheet } from '@shared/ui/bottom-sheet';
import { useCurrentAddress, getCurrentLocation } from '@shared/lib/geolocation';
import { useBridge } from '@shared/lib/bridge';
import { useUserStore, USER_ADDRESS_TYPE, USER_ADDRESS_TYPE_KR } from '@entities/user';
import { isNativeWebView } from '@shared/lib/device/isNativeWebView';

type NaverRouteMode = 'car' | 'public' | 'walk' | 'bicycle';

interface OpenNaverRouteParams {
  mode: NaverRouteMode;
  to: { lat: number; lng: number; name?: string };
  from: { lat: number; lng: number; name?: string }; // 없으면 현재 위치
}

function assertParamsValid(params: OpenNaverRouteParams) {
  if (!params || !params.to) throw new Error('naver.openRoute: "to" 가 필요합니다.');
  const { lat, lng } = params.to;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('naver.openRoute: "to.lat" 와 "to.lng"는 숫자여야 합니다.');
  }
  if (params.from) {
    const { lat: slat, lng: slng } = params.from;
    if (typeof slat !== 'number' || typeof slng !== 'number') {
      throw new Error('naver.openRoute: "from.lat" 와 "from.lng"는 숫자여야 합니다.');
    }
  }
  if (!['car', 'public', 'walk', 'bicycle'].includes(params.mode)) {
    throw new Error('naver.openRoute: 유효하지 않은 모드입니다.');
  }
}

function buildNaverMapWebUrl(params: OpenNaverRouteParams): string {
  const { to, from, mode } = params;

  // 네이버 맵 웹 URL 형식: https://map.naver.com/v5/directions/출발지위도,출발지경도,출발지명/도착지위도,도착지경도,도착지명/이동수단
  const encodeSegment = (lat: number, lng: number, name?: string) => {
    const segment = `${lat},${lng}`;
    if (name) {
      // 이름에 특수문자가 있을 수 있으므로 URL 인코딩
      return `${segment},${encodeURIComponent(name)}`;
    }
    return segment;
  };

  let url = 'https://map.naver.com/v5/directions';

  // 출발지가 있으면 추가
  if (from) {
    url += `/${encodeSegment(from.lat, from.lng, from.name)}`;
  }

  // 도착지 추가
  url += `/${encodeSegment(to.lat, to.lng, to.name)}`;

  // 이동수단 매핑
  const modeMap: Record<NaverRouteMode, string> = {
    car: 'car',
    public: 'transit',
    walk: 'walk',
    bicycle: 'bicycle',
  };

  url += `/${modeMap[mode] || mode}`;

  return url;
}

function useNaverOpenRoute() {
  const bridge = useBridge();

  const openNaverRoute = useCallback(
    async (params: OpenNaverRouteParams) => {
      assertParamsValid(params);

      // 웹 브라우저 환경에서는 네이버 맵 웹 URL을 직접 열기
      if (!isNativeWebView()) {
        const url = buildNaverMapWebUrl(params);
        window.open(url, '_blank');
        return;
      }

      // 네이티브 WebView 환경에서는 브리지를 통해 네이버 맵 앱 열기
      await bridge.request(METHODS.naverOpenRoute, params);
    },
    [bridge]
  );

  return openNaverRoute;
}

interface DeparturePointSheetProps {
  isOpen: boolean;
  close: () => void;
  to: { lat: number; lng: number; name?: string };
}

export function DeparturePointSheet({ isOpen, close, to }: DeparturePointSheetProps) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const openNaverOpenRoute = useNaverOpenRoute();
  const user = useUserStore((state) => state.user);
  const isLoggedIn = !!user;

  // 저장된 주소
  const savedAddresses = user?.addresses || [];

  useEffect(() => {
    async function fetchLocation() {
      setLocationLoading(true);
      setLocationError(null);
      try {
        const location = await getCurrentLocation();
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        setCoords({ lat: latitude, lng: longitude });
      } catch (error) {
        console.error('위치 정보를 가져올 수 없습니다:', error);
        setLocationError(error instanceof Error ? error.message : '위치 정보를 가져올 수 없습니다');
      } finally {
        setLocationLoading(false);
      }
    }

    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen]);

  const shouldFetchAddress = !!coords && !locationLoading && coords.lat !== 0 && coords.lng !== 0;
  const { primaryText, primaryRoad, primaryParcel, isLoading, error } = useCurrentAddress(
    coords || { lat: 0, lng: 0 },
    shouldFetchAddress
  );

  // 임시 좌표를 쓰는 경우에는 주소 조회 결과만 체크
  const hasValidAddress = primaryText || primaryRoad || primaryParcel;

  const label = (() => {
    if (locationLoading) return '위치 정보 가져오는 중…';
    if (isLoading) return '주소 조회 중…';
    if (error) return '주소를 조회할 수 없습니다';
    if (hasValidAddress) return (primaryText || primaryRoad || primaryParcel)!;
    if (locationError) return '위치 정보를 가져올 수 없습니다';
    return '위치 정보 없음';
  })();

  function handleRadioChange(value: string) {
    let selectedCoords: { lat: number; lng: number } | undefined;
    let locationName: string;

    if (value === '1') {
      // 현재 위치
      if (!coords) return;
      selectedCoords = coords;
      locationName = '현재 위치';
    } else {
      // 저장된 주소
      const addressId = value;
      const address = savedAddresses.find((addr) => addr.id === addressId);
      if (!address) return;

      selectedCoords = { lat: address.lat, lng: address.lng };
      locationName = address.alias || USER_ADDRESS_TYPE_KR[address.type] || address.roadAddress;
    }

    if (!selectedCoords) return;

    openNaverOpenRoute({
      mode: 'car',
      to,
      from: { ...selectedCoords, name: locationName },
    });
  }

  return (
    <BottomSheet.Root open={isOpen} onOpenChange={close}>
      <BottomSheet.Overlay className='z-overlay' />
      <BottomSheet.Body className='z-modal'>
        <BottomSheet.Handle />
        <BottomSheet.Header className='border-line-100 border-b'>
          <BottomSheet.Title>어디서 출발하시나요?</BottomSheet.Title>
          <BottomSheet.CloseButton />
        </BottomSheet.Header>
        <div className='py-x5 flex flex-col'>
          <RadioGroup onValueChange={handleRadioChange}>
            {/* 네이버 API 연동 */}
            <label
              htmlFor='1'
              className='border-line-200 p-x4 active:bg-fill-secondary-50 flex justify-between border-b'
            >
              <div className='gap-x2 flex items-center'>
                <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
                <div className='gap-x0_5 flex flex-col text-start'>
                  <p className='body1-extrabold text-text-primary'>현재 위치</p>
                  <span className='body2-regular text-text-secondary'>{label}</span>
                </div>
              </div>
              <RadioGroupItem disabled={isLoading || locationLoading || !coords} id='1' value='1' />
            </label>
            {/* 저장된 주소 확인 (로그인한 경우에만 표시) */}
            {isLoggedIn &&
              savedAddresses.map((address) => {
                const addressLabel = address.alias || USER_ADDRESS_TYPE_KR[address.type] || '';
                const addressText = address.roadAddress || address.address;

                return (
                  <label
                    key={address.id}
                    htmlFor={address.id}
                    className='border-line-200 p-x4 active:bg-fill-secondary-50 flex justify-between border-b'
                  >
                    <div className='gap-x2 flex items-center'>
                      <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
                      <div className='gap-x0_5 flex flex-col text-start'>
                        <p className='body1-extrabold text-text-primary'>{addressLabel}</p>
                        <span className='body2-regular text-text-secondary'>{addressText}</span>
                      </div>
                    </div>
                    <RadioGroupItem id={address.id} value={address.id} />
                  </label>
                );
              })}
          </RadioGroup>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}
