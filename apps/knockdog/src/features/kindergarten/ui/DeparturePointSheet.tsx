import { BottomSheet, Icon } from '@knockdog/ui';
import { RadioGroup, RadioGroupItem } from '@knockdog/ui';
import { useCurrentAddress } from '@shared/lib/geolocation';
import { useCurrentLocation } from '@shared/lib/geolocation';
import { useNaverOpenRoute } from '@features/map';

interface DeparturePointSheetProps {
  isOpen: boolean;
  close: () => void;
  to: { lat: number; lng: number; name?: string };
}

export function DeparturePointSheet({ isOpen, close, to }: DeparturePointSheetProps) {
  const { position: coords, loading: locationLoading, error: locationError } = useCurrentLocation();
  const openNaverOpenRoute = useNaverOpenRoute();

  // const coords = { lat: 37.3595704, lng: 127.105399 }; // 내 위치 임시로 네이버 사옥으로 설정
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

  // @TODO : 임시 더미 데이터 (나중에 실제 저장된 주소 데이터로 대체)
  const savedAddresses = {
    home: { lat: 37.4979, lng: 127.0276 }, // 강남구 논현로 예시
    work: { lat: 37.5665, lng: 126.978 }, // 서울역 예시
  };

  function handleRadioChange(value: string) {
    let selectedCoords: { lat: number; lng: number } | undefined;
    let locationName: string;

    switch (value) {
      case '1': // 현재 위치
        if (!coords) return;
        selectedCoords = coords;
        locationName = '현재 위치';
        break;
      case '2': // 집
        selectedCoords = savedAddresses.home;
        locationName = '집';
        break;
      case '3': // 직장
        selectedCoords = savedAddresses.work;
        locationName = '직장';
        break;
      default:
        return;
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
              <RadioGroupItem
                disabled={locationLoading || isLoading || !!error || !hasValidAddress}
                id='1'
                value='1'
              ></RadioGroupItem>
            </label>
            {/*  저장된 주소 확인  */}
            <label
              htmlFor='2'
              className='border-line-200 p-x4 active:bg-fill-secondary-50 flex justify-between border-b'
            >
              <div className='gap-x2 flex items-center'>
                <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
                <div className='gap-x0_5 flex flex-col text-start'>
                  <p className='body1-extrabold text-text-primary'>집</p>
                  <span className='body2-regular text-text-secondary'>서울 강남구 논현로</span>
                </div>
              </div>
              <RadioGroupItem id='2' value='2'></RadioGroupItem>
            </label>
            <label
              htmlFor='3'
              className='p-x4 border-line-200 active:bg-fill-secondary-50 flex justify-between border-b'
            >
              <div className='gap-x2 flex items-center'>
                <Icon icon='Location' className='text-fill-secondary-500 size-x6' />
                <div className='gap-x0_5 flex flex-col text-start'>
                  <p className='body1-extrabold text-text-primary'>직장</p>
                  <span className='body2-regular text-text-secondary'>서울 강남구 논현로</span>
                </div>
              </div>
              <RadioGroupItem id='3' value='3'></RadioGroupItem>
            </label>
          </RadioGroup>
        </div>
      </BottomSheet.Body>
    </BottomSheet.Root>
  );
}
