import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postRegisterPet, postUpdatePetDetail, postUpdatePetRepresentative, postRemovePet } from './pet';
import { PET_LIST_QUERY_KEY } from './usePetQuery';

const usePetRegisterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRegisterPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PET_LIST_QUERY_KEY] });
    },
  });
};

const usePetUpdateDetailMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdatePetDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PET_LIST_QUERY_KEY] });
    },
  });
};

const usePetUpdateRepresentativeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUpdatePetRepresentative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PET_LIST_QUERY_KEY] });
    },
  });
};

const usePetRemoveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postRemovePet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PET_LIST_QUERY_KEY] });
    },
  });
};

export { usePetRegisterMutation, usePetUpdateDetailMutation, usePetUpdateRepresentativeMutation, usePetRemoveMutation };
