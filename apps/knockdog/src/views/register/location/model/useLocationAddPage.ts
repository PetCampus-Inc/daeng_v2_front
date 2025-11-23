import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import { UserAddress, UserAddressType } from '@entities/user';
import { Address } from '@entities/address';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

import { locationAddSchema, type LocationAddFormState } from './schema';

const useLocationAddPage = () => {
  const { send } = useNavigationResult();
  const { back, getParams } = useStackNavigation();

  const searchParams = useSearchParams();
  const type = searchParams.get('type') as UserAddressType;

  const params = getParams<{ address: Address; alias: string }>();

  if (!type) back();

  const {
    control,
    formState: { isValid },
    handleSubmit: submit,
    setValue,
  } = useForm<LocationAddFormState>({
    resolver: zodResolver(locationAddSchema),
    defaultValues: {
      alias: '',
      address: undefined,
    },
  });

  const handleSubmit = ({ alias, address }: LocationAddFormState) => {
    const userAddress: Omit<UserAddress, 'id'> = { ...address, alias, type };

    send(userAddress);
    back();
  };

  useEffect(() => {
    if (params) {
      setValue('address', params.address);
      setValue('alias', params.alias);
    }
  }, [params]);

  return { type, control, isValid, submit, handleSubmit };
};

export { useLocationAddPage };
