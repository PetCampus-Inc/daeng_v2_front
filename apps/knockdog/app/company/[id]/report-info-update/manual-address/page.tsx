'use client';

import { useRouter } from 'next/navigation';
import { AddressSearchBox } from '@widgets/address-search-box';
import type { AddressSearchResult } from '@entities/address';

// @TODO : StackComponent 구현시 보완 필요
export default function Page() {
  const router = useRouter();

  // FIX: 가희
  const handleAddressSelect = (address: NonNullable<AddressSearchResult['results']['juso']>[0]) => {
    // 선택된 주소 정보를 URL 파라미터로 인코딩
    const addressData = encodeURIComponent(
      JSON.stringify({
        roadAddr: address.roadAddr,
        jibunAddr: address.jibunAddr,
        siNm: address.siNm,
        sggNm: address.sggNm,
        emdNm: address.emdNm,
        zipNo: address.zipNo,
      })
    );
  };

  return (
    <div className='mt-[65px]'>
      <AddressSearchBox onSelect={handleAddressSelect} />
    </div>
  );
}
