import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postAddUserAddress, postUpdateUserAddress, postDeleteUserAddress, type AddressRequest } from './address';
import { UserAddress } from '../model/user';
import { useUserStore } from '../model/store/useUserStore';
import { USER_ADDRESS_TYPE } from '../model/constant/user';
import { getUserInfo, toUser } from './user';
import { userInfoQueryKey } from './useUserQuery';

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
      // 추가 요청의 응답에는 생성된 주소 ID가 없다. 임시 ID('0')를 캐시에 남기면
      // 이후 삭제가 존재하지 않는 주소 ID로 요청되므로, 서버에서 발급한 실제 ID를
      // 즉시 다시 조회해 store와 query cache를 함께 교체한다.
      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      queryClient.setQueryData(userInfoQueryKey(userId), result);
      setUser(toUser(result.data));
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
    onSuccess: (_data, variables) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || currentUser.userId !== userId) return;

      // add와 동일한 이유로 재조회 대신 방금 저장한 값을 그대로 최종 상태로 반영한다.
      const nextAddresses = currentUser.addresses.map((address) =>
        address.type === variables.type ? variables : address
      );

      setUser({ ...currentUser, addresses: nextAddresses });
      queryClient.setQueryData(userInfoQueryKey(userId), (old: Awaited<ReturnType<typeof getUserInfo>> | undefined) =>
        old?.data ? { ...old, data: { ...old.data, addresses: nextAddresses } } : old
      );
    },
  });
};

const useDeleteUserAddressMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: async ({ addressId, type }: { addressId: string; type: UserAddress['type'] }) => {
      // 이전 구현이 새 주소의 임시 ID('0')를 저장했던 경우를 보정한다. 실제 ID를
      // 조회한 뒤 삭제해야 실패 후 이전 주소가 화면에 복구되는 현상을 막을 수 있다.
      if (addressId !== '0') return postDeleteUserAddress(addressId);

      const result = await getUserInfo();
      const address = result.data?.addresses.find((item) => item.type === type);
      if (!address) return;

      return postDeleteUserAddress(String(address.id));
    },
    onMutate: async ({ addressId: deletedAddressId }) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || currentUser.userId !== userId) return undefined;

      // 진행 중인 조회가 낙관적 갱신 이후에 끝나 예전 데이터로 덮어쓰지 않도록 취소
      await queryClient.cancelQueries({ queryKey: userInfoQueryKey(userId) });

      const deletedAddress = currentUser.addresses.find(
        (address) => String(address.id) === deletedAddressId
      );

      setUser({
        ...currentUser,
        addresses: currentUser.addresses.filter((address) => String(address.id) !== deletedAddressId),
      });

      // store는 즉시 갱신되지만, userInfo 쿼리 캐시는 그대로라 화면이 캐시 쪽을
      // 우선해서 읽으면(웹/앱 간 최신화 대응) 방금 지운 항목이 되살아나 보인다.
      // 캐시도 같이 낙관적으로 갱신해 둔다.
      queryClient.setQueryData(userInfoQueryKey(userId), (old: Awaited<ReturnType<typeof getUserInfo>> | undefined) =>
        old?.data
          ? {
              ...old,
              data: {
                ...old.data,
                addresses: old.data.addresses.filter((address) => String(address.id) !== deletedAddressId),
              },
            }
          : old
      );

      return { deletedAddress, userId: currentUser.userId };
    },
    onError: (_error, _deletedAddress, context) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser || !context?.deletedAddress || currentUser.userId !== context.userId) return;
      if (currentUser.addresses.some((address) => String(address.id) === String(context.deletedAddress!.id))) return;

      setUser({
        ...currentUser,
        addresses: [...currentUser.addresses, context.deletedAddress],
      });

      const restoredAddress = context.deletedAddress;
      queryClient.setQueryData(
        userInfoQueryKey(context.userId),
        (old: Awaited<ReturnType<typeof getUserInfo>> | undefined) =>
          old?.data ? { ...old, data: { ...old.data, addresses: [...old.data.addresses, restoredAddress] } } : old
      );
      // 삭제는 onMutate의 낙관적 갱신이 이미 최종 상태와 동일하므로 재조회하지 않는다.
      // (재조회 시 백엔드 반영 지연으로 방금 지운 항목이 다시 살아나 보일 수 있음)
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

      const result = await getUserInfo();
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      queryClient.setQueryData(userInfoQueryKey(userId), result);
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
