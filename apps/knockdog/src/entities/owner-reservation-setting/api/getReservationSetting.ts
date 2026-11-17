import { api } from '@shared/api';

import { parseReservationSetting, type ReservationSettingDto } from '../model/reservationSetting';

/** `GET` - 원장 유치원의 등원 가능 시간과 하루 정원을 조회한다. */
const getReservationSetting = async (): Promise<ReservationSettingDto> => {
  const response = await api.get('owner/school/reservation-setting').json();
  return parseReservationSetting(response);
};

export { getReservationSetting };
