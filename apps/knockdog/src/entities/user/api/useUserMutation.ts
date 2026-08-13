import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../model/store/useUserStore';
import { postRegisterUser, postUpdateGuardianProfile, postUpdateUserNickname, postUpdateUserEmail } from './user';

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

  return useMutation({
    mutationFn: postUpdateGuardianProfile,
    onSuccess: (result) => {
      if (useUserStore.getState().user?.userId !== userId) return;

      queryClient.setQueryData(['userInfo'], result);
    },
  });
};

export {
  useUserRegisterMutation,
  useUserUpdateNicknameMutation,
  useUserUpdateUserEmailMutation,
  useUpdateGuardianProfileMutation,
};
