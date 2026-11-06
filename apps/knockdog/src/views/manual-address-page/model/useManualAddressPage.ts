import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Address, AddressData } from '@entities/address';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

import { manualAddressSchema, type ManualAddressFormState } from './schema';

function useManualAddressPage() {
  const { send } = useNavigationResult<AddressData>();
  const { back } = useStackNavigation();

  const {
    control,
    formState: { isValid },
    handleSubmit: submit,
  } = useForm<ManualAddressFormState>({
    resolver: zodResolver(manualAddressSchema),
    defaultValues: {
      address: undefined,
    },
    mode: 'onChange',
  });

  function handleSelect(address: Address) {
    // Address를 AddressData로 변환
    const addressData: AddressData = {
      roadAddr: address.roadAddress,
      jibunAddr: address.address,
      siNm: '',
      sggNm: '',
      emdNm: '',
      zipNo: '',
    };

    send(addressData);
    back();
  }

  function handleSubmit({ address }: ManualAddressFormState) {
    if (!address) return;

    // Address를 AddressData로 변환
    const addressData: AddressData = {
      roadAddr: address.roadAddress,
      jibunAddr: address.address,
      siNm: '',
      sggNm: '',
      emdNm: '',
      zipNo: '',
    };

    send(addressData);
    back();
  }

  return {
    control,
    isValid,
    submit,
    handleSubmit,
    handleSelect,
  };
}

export { useManualAddressPage };
