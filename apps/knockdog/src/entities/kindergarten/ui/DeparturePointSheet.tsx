import { BottomSheet, Icon } from '@knockdog/ui';
import { RadioGroup, RadioGroupItem } from '@knockdog/ui';
import { useCurrentAddress } from '@shared/lib/geolocation';

interface DeparturePointSheetProps {
  isOpen: boolean;
  close: () => void;
}

export function DeparturePointSheet({ isOpen, close }: DeparturePointSheetProps) {
  const { primaryText, primaryRoad, primaryParcel, isLoading, error } = useCurrentAddress();
  const label = isLoading ? '현재 위치 불러오는 중…' : primaryText || primaryRoad || primaryParcel || error;

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
          <RadioGroup>
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
              <RadioGroupItem disabled={isLoading || !!error} id='1' value='1'></RadioGroupItem>
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
