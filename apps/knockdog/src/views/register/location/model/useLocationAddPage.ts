import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';

import { USER_ADDRESS_TYPE, UserAddress, UserAddressType } from '@entities/user';
import { Address } from '@entities/address';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

import { locationAddSchema, type LocationAddFormState } from './schema';

const useLocationAddPage = () => {
  const { send } = useNavigationResult();
  const { back, getParams } = useStackNavigation();

  const searchParams = useSearchParams();
  const type = searchParams.get('type') as UserAddressType;
  const txId = searchParams.get('_txId');

  if (!type) back();

  const {
    control,
    handleSubmit: submit,
    setValue,
  } = useForm<LocationAddFormState>({
    mode: 'onChange',
    resolver: zodResolver(locationAddSchema),
    defaultValues: {
      alias: '',
      address: undefined,
    },
  });

  const address = useWatch({ control, name: 'address' });
  const alias = useWatch({ control, name: 'alias' });
  const hasAddress = !!address;
  const canSubmit = hasAddress && (type !== USER_ADDRESS_TYPE.WORK || !!alias?.trim());

  const handleAddressSelect = (address: Address) => {
    setValue('address', address, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const handleAddressClear = () => {
    setValue('address', undefined as unknown as LocationAddFormState['address'], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubmit = ({ alias, address }: LocationAddFormState) => {
    const userAddress: Omit<UserAddress, 'id'> = { ...address, alias, type };

    send(userAddress);
    back();
  };

  // getParams()는 1회성으로 sessionStorage를 소비하는 API인데, 같은 경로(/register/location-add)를
  // query만 바꿔 재진입하면 Next.js가 컴포넌트를 재마운트하지 않아 useState 초기화 방식으로는
  // 새 txId의 params를 다시 읽지 못한다. txId가 바뀔 때마다 다시 읽되, StrictMode의 이펙트
  // 2회 실행에서는 같은 txId를 중복 소비하지 않도록 ref로 가드한다.
  const consumedTxIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!txId || consumedTxIdRef.current === txId) return;
    consumedTxIdRef.current = txId;

    const params = getParams<{ address: Address; alias: string }>();
    if (params) {
      setValue('address', params.address, { shouldValidate: true });
      setValue('alias', params.alias, { shouldValidate: true });
    }
  }, [txId, getParams, setValue]);

  return { type, control, canSubmit, hasAddress, submit, handleSubmit, handleAddressSelect, handleAddressClear };
};

export { useLocationAddPage };
