'use client';

import { AddressSearchBox } from '@widgets/address-search-box';
import type { AddressSearchResult, AddressData } from '@entities/address';
import { Header } from '@widgets/Header';
import { useNavigationResult, useStackNavigation } from '@shared/lib/bridge';

export default function Page() {
  const { send } = useNavigationResult<AddressData>();
  const { back } = useStackNavigation();

  const handleAddressSelect = async (address: NonNullable<AddressSearchResult['results']['juso']>[0]) => {
    // 선택된 주소 정보를 이전 화면으로 전달
    send({
      roadAddr: address.roadAddr ?? '',
      jibunAddr: address.jibunAddr ?? '',
      siNm: address.siNm ?? '',
      sggNm: address.sggNm ?? '',
      emdNm: address.emdNm ?? '',
      zipNo: address.zipNo ?? '',
    });

    // 명시적으로 뒤로 가기
    await back();
  };

  return (
    <div>
      <Header>
        <Header.LeftSection>
          <Header.BackButton />
        </Header.LeftSection>
        <Header.Title>직접 주소 입력하기</Header.Title>
      </Header>
      <div className='mb-[24px]'>
        <AddressSearchBox onSelect={handleAddressSelect} />
      </div>
    </div>
  );
}
