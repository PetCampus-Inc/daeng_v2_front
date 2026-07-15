'use client';

import { Header } from '@widgets/Header';

import { ownerMypageContent } from '@features/role-conversion';
import { AddressPicker } from '@features/address-picker';
import type { Address } from '@entities/address';
import { useStackNavigation } from '@shared/lib/bridge';

import { updateEditFormDraftAddress } from '@views/mypage-owner-kindergarten-edit-page/lib/editFormDraft';

function MypageOwnerKindergartenEditAddressPage() {
  const { back } = useStackNavigation();

  const handleSelect = async (selected: Address) => {
    const nextAddress = selected.roadAddress || selected.address;
    if (!nextAddress) return;

    updateEditFormDraftAddress(nextAddress);
    await back();
  };

  return (
    <div className='flex h-full flex-col pb-5'>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>{ownerMypageContent.kindergartenEditAddressSearchTitle}</Header.Title>
      </Header>

      <div className='flex flex-1 flex-col overflow-hidden px-4 pt-4'>
        <AddressPicker showLabel onSelect={handleSelect} />
      </div>
    </div>
  );
}

export { MypageOwnerKindergartenEditAddressPage };
