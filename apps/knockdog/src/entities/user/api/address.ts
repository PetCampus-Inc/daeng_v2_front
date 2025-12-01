import { api, ApiResponse } from '@shared/api';
import { UserAddress } from '../model/user';

/** API 요청용 주소 타입 (id가 number) */
interface AddressRequest {
  id: number;
  type: string;
  alias?: string;
  roadAddress: string;
  address: string;
  lat: number;
  lng: number;
}

/** POST 유저 주소 정보 추가 */
const postAddUserAddress = async (address: Omit<UserAddress, 'id'> & { id?: number }) => {
  const requestBody: AddressRequest = {
    id: 0,
    type: address.type,
    alias: address.alias,
    roadAddress: address.roadAddress,
    address: address.address,
    lat: address.lat,
    lng: address.lng,
  };
  return await api.post(`mypage/addAddress`, { json: { ...requestBody } }).json<ApiResponse<void>>();
};

/** 유저 주소 정보 삭제 */
const postDeleteUserAddress = async (addressId: string | number) => {
  const id = typeof addressId === 'string' ? Number(addressId) : addressId;
  return await api.post(`mypage/deleteAddress`, { json: { addressId: id } }).json<ApiResponse<void>>();
};

/** 유저 주소 정보 수정 */
const postUpdateUserAddress = async (address: UserAddress | (Omit<UserAddress, 'id'> & { id: number })) => {
  const id = typeof address.id === 'string' ? Number(address.id) : address.id;
  const requestBody: AddressRequest = {
    id,
    type: address.type,
    alias: address.alias,
    roadAddress: address.roadAddress,
    address: address.address,
    lat: address.lat,
    lng: address.lng,
  };
  console.log('requestBody', requestBody);
  return await api.post(`mypage/updateAddress`, { json: { ...requestBody } }).json<ApiResponse<void>>();
};

export { postAddUserAddress, postDeleteUserAddress, postUpdateUserAddress };
