import {
  parseGuardianTicketCard,
  parseGuardianTicketDelete,
  parseGuardianTicketDetail,
  parseGuardianTicketManage,
} from '../model/guardianTicket';

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

/** `GET` - 이용권 상세와 사용 내역. 최신순이며 만료 항목은 없다. */
const getGuardianTicketDetail = async (petId: string, ticketId: string) => {
  const response = await api
    .get(`guardian/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}`)
    .json();

  return parseGuardianTicketDetail(response);
};

/** `DELETE` - 만료된 이용권을 보호자 목록에서만 지운다. 이미 지운 이용권도 성공이다. */
const deleteGuardianTicket = async (petId: string, ticketId: string) => {
  const response = await api
    .delete(`guardian/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}`)
    .json();

  return parseGuardianTicketDelete(response);
};

export { deleteGuardianTicket, getGuardianTicketCard, getGuardianTicketDetail, getGuardianTicketManage };
