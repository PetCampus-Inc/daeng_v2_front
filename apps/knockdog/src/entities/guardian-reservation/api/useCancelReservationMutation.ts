import { useMutation, useQueryClient } from '@tanstack/react-query';

import { guardianReservationQueryKeys } from '../config/guardianReservationQueryKeys';
import { cancelGuardianReservation } from './guardianReservation';

import { syncWebViewQuery } from '@shared/lib/sync-webview-query';

interface CancelReservationInput {
  petId: string;
  reservationId: string;
}

const useCancelReservationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ petId, reservationId }: CancelReservationInput) => cancelGuardianReservation({ petId, reservationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: guardianReservationQueryKeys.all });
      syncWebViewQuery.invalidate([...guardianReservationQueryKeys.all]);
    },
  });
};

export { useCancelReservationMutation };
