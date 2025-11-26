import { USER_ADDRESS_TYPE_KR, UserAddress, UserAddressType } from '@entities/user';
import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { useEffect, useState } from 'react';

interface UseLocationFieldOptions {
  type: UserAddressType;
  value?: Omit<UserAddress, 'id'>;
  onChange?: (address?: Omit<UserAddress, 'id'>) => void;
}

const useLocationField = ({ type, value, onChange }: UseLocationFieldOptions) => {
  const [address, setAddress] = useState<Omit<UserAddress, 'id'> | null>(value ?? null);

  const { pushForResult } = useStackNavigation();

  // value prop이 변경되면 address 업데이트
  useEffect(() => {
    setAddress(value ?? null);
  }, [value]);

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
