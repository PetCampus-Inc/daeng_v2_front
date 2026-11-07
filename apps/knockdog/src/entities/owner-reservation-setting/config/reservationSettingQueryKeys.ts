import { getReservationSetting } from '../api/getReservationSetting';
import { toReservationSetting } from '../model/reservationSetting';

const RESERVATION_SETTING_KEY = 'owner-reservation-setting';

const reservationSettingQueryKeys = {
  all: [RESERVATION_SETTING_KEY] as const,
  byUser: (userId: string) => [RESERVATION_SETTING_KEY, userId] as const,
};

const createReservationQueryOptions = (userId?: string) => ({
  queryKey: userId ? reservationSettingQueryKeys.byUser(userId) : reservationSettingQueryKeys.all,
  queryFn: getReservationSetting,
  select: toReservationSetting,
});

export { createReservationQueryOptions, reservationSettingQueryKeys };
