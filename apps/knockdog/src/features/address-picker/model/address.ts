import { Address } from '@entities/address';

type AddressSearchResult = Pick<Address, 'pnu' | 'address' | 'roadAddress'>;

interface AddressSearchResponse {
  /** 페이지당 결과 수 */
  size: number;
  /** 총 결과 수 */
  totalCount: number;
  /** 주소 목록 */
  addressList: AddressSearchResult[];
}

interface ReverseGeocodeDocument {
  address: {
    pnu: string;
    address: string;
    roadAddress: string;
  };
  road_address: {
    address_name: string;
  };
}

interface ReverseGeocodeResponse {
  documents: ReverseGeocodeDocument[];
}

export type { AddressSearchResult, AddressSearchResponse, ReverseGeocodeResponse };
