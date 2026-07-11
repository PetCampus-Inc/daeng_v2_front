'use client';

import { Header } from '@widgets/Header';
import { AddressPicker } from '@features/address-picker';

import { kindergartenRegisterContent } from '@views/role-conversion/kindergarten-register/config/kindergartenRegisterContent';
import { useKindergartenRegisterAddressPage } from '@views/role-conversion/kindergarten-register/model/useKindergartenRegisterAddressPage';

function KindergartenRegisterAddressPage() {
  const { handleSelect } = useKindergartenRegisterAddressPage();

  return (
    <div className='flex h-full flex-col pb-5'>
      <Header>
        <Header.BackButton />
        <Header.Title>{kindergartenRegisterContent.addressRegisterHeaderTitle}</Header.Title>
      </Header>

      <div className='flex flex-1 flex-col overflow-hidden px-4 pt-4'>
        <AddressPicker showLabel onSelect={handleSelect} />
      </div>
    </div>
  );
}

export { KindergartenRegisterAddressPage };
