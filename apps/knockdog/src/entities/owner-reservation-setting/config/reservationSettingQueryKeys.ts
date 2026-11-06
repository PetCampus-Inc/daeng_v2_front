import { getReservationSetting } from '../api/getReservationSetting';
import { toReservationSetting } from '../model/reservationSetting';

const reservationSettingQueryKeys = {
  all: ['owner-reservation-setting'] as const,
  byUser: (userId?: string) => [...reservationSettingQueryKeys.all, userId] as const,
} as const;

const createReservationQueryOptions = (userId?: string) => ({
  queryKey: reservationSettingQueryKeys.byUser(userId),
  queryFn: getReservationSetting,
  select: toReservationSetting,
});

export { createReservationQueryOptions, reservationSettingQueryKeys };
