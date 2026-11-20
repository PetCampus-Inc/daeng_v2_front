import { useMutation, useQueryClient } from '@tanstack/react-query';

import { guardianReservationQueryKeys } from '../config/guardianReservationQueryKeys';
import { postGuardianReservation, type GuardianReservationCreate } from './guardianReservation';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

interface CreateReservationInput {
  idempotencyKey: string;
  body: GuardianReservationCreate;
}

const useCreateReservationMutation = (petId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idempotencyKey, body }: CreateReservationInput) =>
      postGuardianReservation({ petId, idempotencyKey, body }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: guardianReservationQueryKeys.all });
      syncWebViewQuery.invalidate([...guardianReservationQueryKeys.all]);
    },
  });
};

export { useCreateReservationMutation };
