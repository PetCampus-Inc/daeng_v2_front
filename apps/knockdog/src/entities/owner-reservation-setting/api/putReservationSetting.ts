import { api, REQUEST_FAILED_MESSAGE } from '@shared/api';

import {
  parseReservationSetting,
  toReservationSettingRequest,
  type ReservationSettingDraft,
  type ReservationSettingDto,
} from '../model/reservationSetting';

/** `PUT` - 평일·주말 등원 가능 시간과 하루 정원을 교체 저장한다. */
const putReservationSetting = async (draft: ReservationSettingDraft): Promise<ReservationSettingDto> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error(REQUEST_FAILED_MESSAGE);
  }

  const body = toReservationSettingRequest(draft);
  if (!body) throw new Error('등원 가능 시간을 모두 입력해 주세요.');

  const response = await api.put('owner/school/reservation-setting', { json: body }).json();
  return parseReservationSetting(response);
};

export { putReservationSetting };
