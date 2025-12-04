import { api, ApiResponse } from '@shared/api';
import { UserAddress } from '../model/user';

/** API 요청용 주소 타입 (id가 number) */
export interface AddressRequest {
  id?: number;
  operation: 'ADD' | 'UPDATE' | 'DELETE';
  type: string;
  alias?: string;
  roadAddress: string;
  address: string;
  lat: number;
  lng: number;
}

/** POST 유저 주소 API (통합) */
const postUserAddress = async (params: AddressRequest) => {
  // DELETE operation일 때는 id와 operation만 전송
  const requestBody = params.operation === 'DELETE' ? { id: params.id, operation: params.operation } : { ...params };
  return await api.post(`mypage/address`, { json: requestBody }).json<ApiResponse<void>>();
};

/** POST 유저 주소 추가 */
const postAddUserAddress = async (params: AddressRequest) => {
  const addressRequest: AddressRequest = {
    operation: 'ADD',
    type: params.type,
    alias: params.alias,
    roadAddress: params.roadAddress,
    address: params.address,
    lat: params.lat,
    lng: params.lng,
  };
  return await postUserAddress(addressRequest);
};

/** POST 유저 주소 정보 수정 */
const postUpdateUserAddress = async (params: AddressRequest) => {
  const addressRequest: AddressRequest = {
    id: typeof params.id === 'string' ? Number(params.id) : params.id,
    operation: 'UPDATE',
    type: params.type,
    alias: params.alias,
    roadAddress: params.roadAddress,
    address: params.address,
    lat: params.lat,
    lng: params.lng,
  };
  return await postUserAddress(addressRequest);
};

/** POST 유저 주소 삭제 */
const postDeleteUserAddress = async (addressId: string) => {
  const addressRequest: AddressRequest = {
    id: Number(addressId),
    operation: 'DELETE',
  } as AddressRequest;
  return await postUserAddress(addressRequest);
};

export { postAddUserAddress, postUpdateUserAddress, postDeleteUserAddress };
