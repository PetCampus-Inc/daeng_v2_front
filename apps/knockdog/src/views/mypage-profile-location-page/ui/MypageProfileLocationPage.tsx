'use client';

import { Header } from '@widgets/Header';
import { Divider } from '@knockdog/ui';
import { LocationPermissionSection } from '@features/location-permission';
import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType, useUserStore } from '@entities/user';
import { useStackNavigation } from '@shared/lib/bridge';
import { AddressRegister } from '@widgets/address-register';
import { useForm } from 'react-hook-form';
import {
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
} from '@entities/user/api/useAddressMutation';

type LocationFormState = Record<UserAddressType, Omit<UserAddress, 'id'>>;

function MypageProfileLocationPage() {
  const { back } = useStackNavigation();
  const user = useUserStore((state) => state.user);

  const addMutation = useAddUserAddressMutation();
  const updateMutation = useUpdateUserAddressMutation();
  const deleteMutation = useDeleteUserAddressMutation();

  // addressList를 LocationFormState 형식으로 변환
  const defaultValues: Partial<LocationFormState> = user?.addresses
    ? user.addresses.reduce((acc, address) => {
        const { id, ...rest } = address;
        acc[address.type as UserAddressType] = rest;
        return acc;
      }, {} as Partial<LocationFormState>)
    : {};

  // 기존 주소 정보를 type별로 매핑 (id 포함)
  const existingAddressMap: Partial<Record<UserAddressType, UserAddress>> = user?.addresses
    ? user.addresses.reduce(
        (acc, address) => {
          acc[address.type as UserAddressType] = address;
          return acc;
        },
        {} as Partial<Record<UserAddressType, UserAddress>>
      )
    : {};

  const { control, handleSubmit: submit } = useForm<LocationFormState>({
    defaultValues,
  });

  const handleAdd = async (type: UserAddressType, address: Omit<UserAddress, 'id'>) => {
    const alias = address.alias || USER_ADDRESS_TYPE_KR[type];
    const addressData: UserAddress = {
      ...address,
      id: '0',
      type,
      alias,
    };
    await addMutation.mutateAsync(addressData);
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
  };

  const handleDelete = async (type: UserAddressType) => {
    const existingAddress = existingAddressMap[type];
    if (!existingAddress) return;

    await deleteMutation.mutateAsync(existingAddress.id);
  };

  return (
    <div className='flex h-full flex-col'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>주소 변경</Header.Title>
      </Header>

      <LocationPermissionSection />

      <Divider size='thick' className='my-4' />

      <AddressRegister
        id='location-form'
        className='px-4'
        control={control}
        defaultValues={defaultValues}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

export { MypageProfileLocationPage };
