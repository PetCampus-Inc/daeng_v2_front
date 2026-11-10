import { parseGuardianTicketCard, parseGuardianTicketManage } from '../model/guardianTicket';

import { api } from '@shared/api';

/** `GET` - 예약 탭 이용권 카드. 사용 중인 이용권만 온다. */
const getGuardianTicketCard = async (petId: string) => {
  const response = await api.get(`guardian/pets/${encodeURIComponent(petId)}/tickets`).json();
  return parseGuardianTicketCard(response);
};

/** `GET` - 이용권 관리 목록. schoolId를 생략하면 현재 연결된 유치원이다. */
const getGuardianTicketManage = async (petId: string) => {
  const response = await api.get(`guardian/pets/${encodeURIComponent(petId)}/tickets/manage`).json();
  return parseGuardianTicketManage(response);
};

export { getGuardianTicketCard, getGuardianTicketManage };
