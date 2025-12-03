import { useMutation } from '@tanstack/react-query';
import { postRegisterUser, postUpdateUserNickname, postUpdateUserEmail } from './user';

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

export { useUserRegisterMutation, useUserUpdateNicknameMutation, useUserUpdateUserEmailMutation };
