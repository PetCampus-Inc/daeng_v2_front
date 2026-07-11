import { Address } from '@entities/address';
import { useStackNavigation } from '@shared/lib/bridge';

import { formatAddress } from '@features/role-conversion/lib/formatKindergartenRegisterField';
import { updateRegisterFormDraftAddress } from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';

function useKindergartenRegisterAddressPage() {
  const { back } = useStackNavigation();

  async function handleSelect(address: Address) {
    const selectedAddress = formatAddress(address.roadAddress || address.address);

    updateRegisterFormDraftAddress(selectedAddress);
    await back();
  }

  return { handleSelect };
}

export { useKindergartenRegisterAddressPage };
