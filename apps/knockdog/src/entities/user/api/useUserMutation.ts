import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../model/store/useUserStore';
import { postRegisterUser, postUpdateGuardianProfile, postUpdateUserNickname, postUpdateUserEmail, toUser } from './user';
import { userInfoQueryKey } from './useUserQuery';

const useUserRegisterMutation = () => {
  return useMutation({
    mutationFn: postRegisterUser,
  });
};

const useUserUpdateNicknameMutation = () => {
  return useMutation({
    mutationFn: postUpdateUserNickname,
  });
};

const useUserUpdateUserEmailMutation = () => {
  return useMutation({
    mutationFn: postUpdateUserEmail,
  });
};

const useUpdateGuardianProfileMutation = () => {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.userId);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: postUpdateGuardianProfile,
    onSuccess: (result) => {
      if (useUserStore.getState().user?.userId !== userId || result.data?.userId !== userId) return;

      queryClient.setQueryData(userInfoQueryKey(userId), result);
      if (result.data) {
        setUser(toUser(result.data));
      }
    },
  });
};

export {
  useUserRegisterMutation,
  useUserUpdateNicknameMutation,
  useUserUpdateUserEmailMutation,
  useUpdateGuardianProfileMutation,
};
