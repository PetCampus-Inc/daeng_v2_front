import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAddUserAddress, postUpdateUserAddress, postDeleteUserAddress, type AddressRequest } from './address';
import { UserAddress } from '../model/user';
import { useUserStore } from '../model/store/useUserStore';
import { getUserInfo } from './user';

const useAddUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (params: UserAddress) => {
      const addressRequest: AddressRequest = {
        operation: 'ADD',
        type: params.type,
        alias: params.alias,
        roadAddress: params.roadAddress,
        address: params.address,
        lat: params.lat,
        lng: params.lng,
      };
      return postAddUserAddress(addressRequest);
    },
    onSuccess: async () => {
      // userInfo 쿼리 무효화하여 최신 데이터 가져오기
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      // store 업데이트
      const result = await getUserInfo();
      if (result.data) {
        setUser(result.data);
      }
    },
  });
};

const useUpdateUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (params: UserAddress) => {
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
      return postUpdateUserAddress(addressRequest);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      const result = await getUserInfo();
      if (result.data) {
        setUser(result.data);
      }
    },
  });
};

const useDeleteUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: postDeleteUserAddress,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      const result = await getUserInfo();
      if (result.data) {
        setUser(result.data);
      }
    },
  });
};

const useUpdateUserAddressesMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: async ({
      toAdd,
      toUpdate,
      toDelete,
    }: {
      toAdd: Omit<UserAddress, 'id'>[];
      toUpdate: UserAddress[];
      toDelete: string[];
    }) => {
      // 모든 작업을 병렬로 실행
      const promises = [
        ...toAdd.map((address) =>
          postAddUserAddress({
            operation: 'ADD',
            type: address.type,
            alias: address.alias,
            roadAddress: address.roadAddress,
            address: address.address,
            lat: address.lat,
            lng: address.lng,
          })
        ),
        ...toUpdate.map((address) =>
          postUpdateUserAddress({
            id: typeof address.id === 'string' ? Number(address.id) : address.id,
            operation: 'UPDATE',
            type: address.type,
            alias: address.alias,
            roadAddress: address.roadAddress,
            address: address.address,
            lat: address.lat,
            lng: address.lng,
          })
        ),
        ...toDelete.map((addressId) => postDeleteUserAddress(addressId)),
      ];

      await Promise.all(promises);
    },
    onSuccess: async () => {
      // 모든 작업 완료 후 userInfo 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      // store 업데이트
      const result = await getUserInfo();
      if (result.data) {
        setUser(result.data);
      }
    },
  });
};

export {
  useAddUserAddressMutation,
  useUpdateUserAddressMutation,
  useDeleteUserAddressMutation,
  useUpdateUserAddressesMutation,
};
