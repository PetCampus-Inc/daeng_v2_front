import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAddUserAddress, postUpdateUserAddress, postDeleteUserAddress, type AddressRequest } from './address';
import { UserAddress } from '../model/user';
import { useUserStore } from '../model/store/useUserStore';
import { USER_ADDRESS_TYPE } from '../model/constant/user';
import { getUserInfo, toUser } from './user';

const toApiAddressType = (type: UserAddress['type']) => (type === USER_ADDRESS_TYPE.WORK ? 'OTHER' : type);

const useAddUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (params: UserAddress) => {
      const addressRequest: AddressRequest = {
        operation: 'ADD',
        type: toApiAddressType(params.type),
        alias: params.alias,
        roadAddress: params.roadAddress,
        address: params.address,
        addressDetail: params.detail,
        lat: params.lat,
        lng: params.lng,
      };
      return postAddUserAddress(addressRequest);
    },
    onSuccess: async () => {
      if (useUserStore.getState().user?.userId !== userId) return;

      // userInfo 쿼리 무효화하여 최신 데이터 가져오기
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      // store 업데이트
      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      if (result.data) {
        setUser(toUser(result.data));
      }
    },
  });
};

const useUpdateUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (params: UserAddress) => {
      const addressRequest: AddressRequest = {
        id: typeof params.id === 'string' ? Number(params.id) : params.id,
        operation: 'UPDATE',
        type: toApiAddressType(params.type),
        alias: params.alias,
        roadAddress: params.roadAddress,
        address: params.address,
        addressDetail: params.detail,
        lat: params.lat,
        lng: params.lng,
      };
      return postUpdateUserAddress(addressRequest);
    },
    onSuccess: async () => {
      if (useUserStore.getState().user?.userId !== userId) return;

      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      if (result.data) {
        setUser(toUser(result.data));
      }
    },
  });
};

const useDeleteUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: postDeleteUserAddress,
    onMutate: (deletedAddressId) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || currentUser.userId !== userId) return undefined;

      const deletedAddress = currentUser.addresses.find(
        (address) => String(address.id) === deletedAddressId
      );

      setUser({
        ...currentUser,
        addresses: currentUser.addresses.filter((address) => String(address.id) !== deletedAddressId),
      });

      return { deletedAddress, userId: currentUser.userId };
    },
    onError: (_error, _deletedAddressId, context) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || !context?.deletedAddress || currentUser.userId !== context.userId) return;
      if (currentUser.addresses.some((address) => String(address.id) === String(context.deletedAddress!.id))) return;

      setUser({
        ...currentUser,
        addresses: [...currentUser.addresses, context.deletedAddress],
      });
    },
    onSuccess: async () => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || currentUser.userId !== userId) return;

      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      if (result.data) {
        setUser(toUser(result.data));
      }
    },
  });
};

const useUpdateUserAddressesMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
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
            type: toApiAddressType(address.type),
            alias: address.alias,
            roadAddress: address.roadAddress,
            address: address.address,
            addressDetail: address.detail,
            lat: address.lat,
            lng: address.lng,
          })
        ),
        ...toUpdate.map((address) =>
          postUpdateUserAddress({
            id: typeof address.id === 'string' ? Number(address.id) : address.id,
            type: toApiAddressType(address.type),
            alias: address.alias,
            roadAddress: address.roadAddress,
            address: address.address,
            addressDetail: address.detail,
            lat: address.lat,
            lng: address.lng,
          })
        ),
        ...toDelete.map((addressId) => postDeleteUserAddress(addressId)),
      ];

      await Promise.all(promises);
    },
    onSuccess: async () => {
      if (useUserStore.getState().user?.userId !== userId) return;

      // 모든 작업 완료 후 userInfo 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ['userInfo'] });

      // store 업데이트
      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      if (result.data) {
        setUser(toUser(result.data));
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
