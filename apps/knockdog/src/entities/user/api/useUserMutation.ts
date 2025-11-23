import { useMutation } from '@tanstack/react-query';
import { postRegisterUser } from './user';

const useUserRegisterMutation = () => {
  return useMutation({
    mutationFn: postRegisterUser,
  });
};

export { useUserRegisterMutation };
