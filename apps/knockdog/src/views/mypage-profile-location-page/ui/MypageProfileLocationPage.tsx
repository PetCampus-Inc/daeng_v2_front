'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@widgets/Header';
import { Divider } from '@knockdog/ui';
import { LocationPermissionSection } from '@features/location-permission';
import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType, useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { AddressRegister } from '@widgets/address-register';
import {
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
} from '@entities/user/api/useAddressMutation';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

function MypageProfileLocationPage() {
  const { back } = useStackNavigation();
  const user = useUserStore((state) => state.user);
  // 주소 mutation이 store를 낙관적으로 갱신한다. 여기서 별도 query cache를 우선하면
  // 이미 끝난 조회의 과거 응답이 삭제 직후 화면을 다시 덮을 수 있으므로 store만 사용한다.
  const addresses = user?.addresses ?? [];

  const addMutation = useAddUserAddressMutation();
  const updateMutation = useUpdateUserAddressMutation();
  const deleteMutation = useDeleteUserAddressMutation();

  // addressList를 LocationFormState 형식으로 변환
  const defaultValues = useMemo<Partial<LocationFormState>>(
    () =>
      addresses.reduce((acc, address) => {
        const { id, ...rest } = address;
        acc[address.type as UserAddressType] = rest;
        return acc;
      }, {} as Partial<LocationFormState>),
    [addresses]
  );

  // 기존 주소 정보를 type별로 매핑 (id 포함)
  const existingAddressMap: Partial<Record<UserAddressType, UserAddress>> = addresses
    ? addresses.reduce(
        (acc, address) => {
          acc[address.type as UserAddressType] = address;
          return acc;
        },
        {} as Partial<Record<UserAddressType, UserAddress>>
      )
    : {};

  const addressIds: Partial<Record<UserAddressType, string>> = Object.fromEntries(
    Object.entries(existingAddressMap).map(([type, address]) => [type, String(address.id)])
  );

  const { control, handleSubmit: submit, reset, setValue } = useForm<LocationFormState>({
    defaultValues,
  });

  // 주소 목록이 변경될 때만 form을 서버 상태와 동기화한다. `values` prop과
  // keepDirtyValues를 함께 사용하면 이전에 삭제한 값이 다시 남을 수 있다.
  useEffect(() => {
    reset(defaultValues as LocationFormState);
  }, [defaultValues, reset]);

  const handleAdd = async (type: UserAddressType, address: Omit<UserAddress, 'id'>) => {
    const alias = address.alias || USER_ADDRESS_TYPE_KR[type];
    const addressData: UserAddress = {
      ...address,
      id: '0',
      type,
      alias,
    };
    await addMutation.mutateAsync(addressData);
    setValue(type, address, { shouldDirty: false });
  };

  const handleUpdate = async (type: UserAddressType, address: Omit<UserAddress, 'id'>) => {
    const existingAddress = existingAddressMap[type];
    if (!existingAddress) return;

    const alias = address.alias || USER_ADDRESS_TYPE_KR[type];

    const addressData: UserAddress = {
      ...address,
      id: existingAddress.id,
      type,
      alias,
    };
    await updateMutation.mutateAsync(addressData);
    setValue(type, address, { shouldDirty: false });
  };

  const handleDelete = async (type: UserAddressType) => {
    const existingAddress = existingAddressMap[type];
    if (!existingAddress) return;

    await deleteMutation.mutateAsync({ addressId: String(existingAddress.id), type });
    // `reset({})`만으로는 이미 등록된 Controller 필드가 최초 defaultValue를 유지할 수
    // 있다. 삭제가 성공한 뒤 해당 필드를 명시적으로 비워 과거 주소가 남지 않게 한다.
    setValue(type, undefined as unknown as Omit<UserAddress, 'id'>, { shouldDirty: false });
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>장소 관리</Header.Title>
      </Header>

      <LocationPermissionSection />

      <Divider size='thick' className='my-4' />

      <AddressRegister
        id='location-form'
        className='px-4'
        control={control}
        addressIds={addressIds}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

export { MypageProfileLocationPage };
