import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useState } from 'react';

interface UseLocationFieldOptions {
  type: UserAddressType;
  onChange?: (address?: Omit<UserAddress, 'id'>) => void;
}

const useLocationField = ({ type, onChange }: UseLocationFieldOptions) => {
  const [address, setAddress] = useState<Omit<UserAddress, 'id'> | null>(null);

  const { pushForResult } = useStackNavigation();

  const navigateToAddressForm = async (params?: Record<string, unknown>) => {
    const result = await pushForResult<Omit<UserAddress, 'id'>>(
      {
        pathname: route.register.location.add.root,
        query: { type },
        params,
      },
      600_000
    );

    setAddress(result);
    onChange?.(result);
  };

  /** 추가하기 버튼 */
  const add = () => {
    if (address) return;
    navigateToAddressForm();
  };

  /** 수정 버튼 */
  const modify = async () => {
    if (!address) return;

    const { alias, ...restAddress } = address;
    navigateToAddressForm({ address: restAddress, alias });
  };

  /** 삭제 버튼 */
  const remove = () => {
    setAddress(null);
    onChange?.(undefined);
  };

  const alias = address?.alias || USER_ADDRESS_TYPE_KR[type];

  return { alias, address, add, modify, remove };
};

export { useLocationField };
