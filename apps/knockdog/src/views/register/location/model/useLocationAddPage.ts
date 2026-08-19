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

  const INITIAL_VALUES = {
    alias: '',
    address: undefined as unknown as LocationAddFormState['address'],
  } satisfies LocationAddFormState;

  const {
    control,
    handleSubmit: submit,
    setValue,
    reset,
  } = useForm<LocationAddFormState>({
    mode: 'onChange',
    resolver: zodResolver(locationAddSchema),
    defaultValues: INITIAL_VALUES,
  });

  // 폼이 실제로 시작 시점과 달라졌는지는 RHF의 formState.isDirty 대신 직접 값을 비교해 판단한다.
  // isDirty는 setValue(shouldDirty 없이 호출)로는 갱신되지 않고, 반대로 브라우저 자동완성 등으로
  // 실제 input 이벤트가 발생하면 사용자가 아무것도 바꾸지 않았어도 true가 될 수 있어 신뢰할 수 없다.
  const baselineRef = useRef<LocationAddFormState>(INITIAL_VALUES);
  const watchedValues = useWatch({ control });

  const address = useWatch({ control, name: 'address' });
  const alias = useWatch({ control, name: 'alias' });
  const hasAddress = !!address;
  const canSubmit = hasAddress && (type !== USER_ADDRESS_TYPE.WORK || !!alias?.trim());
  const isDirty = JSON.stringify(watchedValues) !== JSON.stringify(baselineRef.current);

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

    const params = getParams<{ address?: Address; alias?: string }>();
    // 네이티브 환경의 getParams()는 실제 전달값이 없으면 라우팅용 query({ type, _txId })를
    // 그대로 반환하는 fallback을 갖고 있다. address 키가 있을 때만 진짜 복원 데이터로 취급한다.
    if (params && params.address) {
      const restoredValues: LocationAddFormState = { address: params.address, alias: params.alias ?? '' };
      baselineRef.current = restoredValues;
      reset(restoredValues, { keepDefaultValues: true });
    }
  }, [txId, getParams, reset]);

  return {
    type,
    control,
    canSubmit,
    hasAddress,
    isDirty,
    back,
    submit,
    handleSubmit,
    handleAddressSelect,
    handleAddressClear,
  };
};

export { useLocationAddPage };
