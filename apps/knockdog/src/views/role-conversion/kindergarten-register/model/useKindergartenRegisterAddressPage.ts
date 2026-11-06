import { Address } from '@entities/address';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

import { formatAddress } from '@features/role-conversion/lib/formatKindergartenRegisterField';
import { updateRegisterFormDraftAddress } from '@views/role-conversion/kindergarten-register/lib/registerFormDraft';

function useKindergartenRegisterAddressPage() {
  const { send } = useNavigationResult<string>();
  const { back } = useStackNavigation();

  async function handleSelect(address: Address) {
    const selectedAddress = formatAddress(address.roadAddress || address.address);

    // 네이티브: WebView 간 sessionStorage 미공유 → bridge result
    send(selectedAddress);
    // 웹: 등록 폼 remount 시 draft로 복원
    updateRegisterFormDraftAddress(selectedAddress);

    await back();
  }

  return { handleSelect };
}

export { useKindergartenRegisterAddressPage };
