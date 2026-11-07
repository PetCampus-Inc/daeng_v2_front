import { useQuery } from '@tanstack/react-query';

import { createReservationQueryOptions } from '../config/reservationSettingQueryKeys';

interface ReservationQueryParams {
  userId?: string;
  enabled?: boolean;
}

const useReservationSettingQuery = ({ userId, enabled = true }: ReservationQueryParams = {}) =>
  useQuery({
    ...createReservationQueryOptions(userId),
    enabled: enabled && Boolean(userId),
    staleTime: 0,
  });

export { useReservationSettingQuery };
