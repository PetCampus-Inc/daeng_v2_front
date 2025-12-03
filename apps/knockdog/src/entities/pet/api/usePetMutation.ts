import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postRegisterPet, postUpdatePetDetail, postUpdatePetRepresentative } from './pet';

const usePetRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRegisterPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petList'] });
    },
  });
};

const usePetUpdateDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdatePetDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petList'] });
    },
  });
};

const usePetUpdateRepresentativeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdatePetRepresentative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petList'] });
    },
  });
};

export { usePetRegisterMutation, usePetUpdateDetailMutation, usePetUpdateRepresentativeMutation };
