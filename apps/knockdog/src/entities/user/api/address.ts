import { api, ApiResponse } from '@shared/api';
import { UserAddress } from '../model/user';

/** POST 유저 주소 정보 추가 */
const postAddUserAddress = async (address: UserAddress) => {
  console.log('postAddUserAddress', address);
  return await api.post(`mypage/addUserAddress`, { json: { address } }).json<ApiResponse<void>>();
};

/** 유저 주소 정보 삭제 */
const postDeleteUserAddress = async (addressId: string) => {
  return await api.post(`mypage/deleteUserAddress`, { json: { addressId } }).json<ApiResponse<void>>();
};
/** 유저 주소 정보 수정 */
const postUpdateUserAddress = async (address: UserAddress) => {
  console.log('postUpdateUserAddress', address);
  return await api.post(`mypage/updateUserAddress`, { json: { address } }).json<ApiResponse<void>>();
};

export { postAddUserAddress, postDeleteUserAddress, postUpdateUserAddress };
