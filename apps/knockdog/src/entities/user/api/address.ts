import { api, ApiResponse } from '@shared/api';
import { UserAddress } from '../model/user';

/** API 요청용 주소 타입 (id가 number) */
export type AddressRequest =
  | {
      operation: 'DELETE';
      id: number;
    }
  | {
      operation: 'ADD';
      type: string;
      alias?: string;
      roadAddress: string;
      address: string;
      addressDetail?: string;
      lat: number;
      lng: number;
    }
  | {
      operation: 'UPDATE';
      id: number;
      type: string;
      alias?: string;
      roadAddress: string;
      address: string;
      addressDetail?: string;
      lat: number;
      lng: number;
    };

/** POST 유저 주소 API (통합) */
const postUserAddress = async (params: AddressRequest) => {
  // DELETE operation일 때는 id와 operation만 전송
  if (params.operation === 'DELETE') {
    const requestBody = { id: params.id, operation: params.operation };
    return await api.post(`mypage/address`, { json: requestBody }).json<ApiResponse<void>>();
  }
  return await api.post(`mypage/address`, { json: params }).json<ApiResponse<void>>();
};

/** POST 유저 주소 추가 */
const postAddUserAddress = async (params: Omit<Extract<AddressRequest, { operation: 'ADD' }>, 'operation'>) => {
  return await postUserAddress({ ...params, operation: 'ADD' });
};

/** POST 유저 주소 정보 수정 */
const postUpdateUserAddress = async (
  params: Omit<Extract<AddressRequest, { operation: 'UPDATE' }>, 'operation'> & { id: string | number }
) => {
  return await postUserAddress({
    ...params,
    id: typeof params.id === 'string' ? Number(params.id) : params.id,
    operation: 'UPDATE',
  });
};

/** POST 유저 주소 삭제 */
const postDeleteUserAddress = async (addressId: string) => {
  return await postUserAddress({
    id: Number(addressId),
    operation: 'DELETE',
  });
};

export { postAddUserAddress, postUpdateUserAddress, postDeleteUserAddress };
