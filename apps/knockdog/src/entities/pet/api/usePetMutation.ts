import { useMutation } from '@tanstack/react-query';
import { postRegisterPet, postUpdatePetDetail } from './pet';

const usePetRegisterMutation = () => {
  return useMutation({
    mutationFn: postRegisterPet,
  });
};

const usePetUpdateDetailMutation = () => {
  return useMutation({
    mutationFn: postUpdatePetDetail,
  });
};

export { usePetRegisterMutation, usePetUpdateDetailMutation };
