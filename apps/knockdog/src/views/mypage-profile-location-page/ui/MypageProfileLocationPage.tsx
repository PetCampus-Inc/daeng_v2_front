'use client';

import { Header } from '@widgets/Header';
import { Divider } from '@knockdog/ui';
import { LocationPermissionSection } from '@features/location-permission';
import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType, useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { AddressRegister } from '@widgets/address-register';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

function MypageProfileLocationPage() {
  const { back } = useStackNavigation();
  const user = useUserStore((state) => state.user);

  // addressList를 LocationFormState 형식으로 변환
  const defaultValues: Partial<LocationFormState> = user?.addressList
    ? user.addressList.reduce((acc, address) => {
        const { id, ...rest } = address;
        acc[address.type as UserAddressType] = rest;
        return acc;
      }, {} as Partial<LocationFormState>)
    : {};

  const handleSubmit = async (data: LocationFormState) => {
    if (!user) return;

    // TODO: 집 주소 입력 안 했을 경우 처리
    if (!data.HOME) {
      console.log('no home');
      return;
    }

    const addresses = Object.values(data)
      .filter((address): address is Omit<UserAddress, 'id'> => address !== undefined)
      .map((address) => {
        const alias = address.alias || USER_ADDRESS_TYPE_KR[address.type as UserAddressType];

        return {
          ...address,
          alias,
          addressType: address.type as UserAddressType,
        };
      });

    // TODO: 주소 업데이트 mutation 호출
    console.log('Update addresses:', addresses);

    // 완료 후 이전 페이지로
    back();
  };

  return (
    <div className='flex h-full flex-col'>
      <Header withSpacing={false}>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>주소 변경</Header.Title>
      </Header>

      <LocationPermissionSection />

      <Divider size='thick' className='my-4' />

      {/* <AddressRegister id='location-form' className='px-4' /> */}
    </div>
  );
}

export { MypageProfileLocationPage };
