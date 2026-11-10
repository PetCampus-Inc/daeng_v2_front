import {
  parseChargedPetTicket,
  parsePetTicketDetail,
  parsePetTicketHistory,
  parsePetTicketList,
  parseVoidResponse,
  type PetTicketChargeRequest,
  type PetTicketExpiryRequest,
  type PetTicketHoldRequest,
} from '../model/petTicket';

import { api } from '@shared/api';

/** `GET` - 원생 이용권 목록. 필터 없이 전체와 상태별 개수를 받는다. */
const getPetTickets = async (petId: string) => {
  const response = await api.get(`owner/pets/${encodeURIComponent(petId)}/tickets`).json();
  return parsePetTicketList(response);
};

/** `GET` - 원생 이용권 상세. 이력은 별도 API다. */
const getPetTicket = async (petId: string, ticketId: string) => {
  const response = await api.get(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}`).json();
  return parsePetTicketDetail(response);
};

/** `GET` - 원생 이용권 이력. 최신 이력이 앞에 온다. */
const getPetTicketHistory = async (petId: string, ticketId: string) => {
  const response = await api
    .get(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}/history`)
    .json();
  return parsePetTicketHistory(response);
};

interface PostPetTicketParams {
  petId: string;
  idempotencyKey: string;
  body: PetTicketChargeRequest;
}

/** `POST` - 원생 이용권 충전. 같은 Idempotency-Key 재시도는 최초 성공 응답이다. */
const postPetTicket = async ({ petId, idempotencyKey, body }: PostPetTicketParams) => {
  const response = await api
    .post(`owner/pets/${encodeURIComponent(petId)}/tickets`, {
      json: body,
      headers: { 'Idempotency-Key': idempotencyKey },
    })
    .json();

  return parseChargedPetTicket(response);
};

/** `DELETE` - 원생 이용권 삭제. */
const deletePetTicket = async (petId: string, ticketId: string) => {
  const response = await api
    .delete(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}`)
    .json();
  return parseVoidResponse(response);
};

interface PatchPetTicketExpiryParams {
  petId: string;
  ticketId: string;
  body: PetTicketExpiryRequest;
}

interface PostPetTicketHoldParams {
  petId: string;
  ticketId: string;
  body: PetTicketHoldRequest;
}

/** `POST` - 원생 이용권 홀딩. 응답은 갱신된 상세다. */
const postPetTicketHold = async ({ petId, ticketId, body }: PostPetTicketHoldParams) => {
  const response = await api
    .post(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}/hold`, { json: body })
    .json();
  return parsePetTicketDetail(response);
};

/** `DELETE` - 원생 이용권 홀딩 취소. 응답은 갱신된 상세다. */
const deletePetTicketHold = async (petId: string, ticketId: string) => {
  const response = await api
    .delete(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}/hold`)
    .json();
  return parsePetTicketDetail(response);
};

/** `PATCH` - 원생 이용권 만료일 수정. 응답은 갱신된 상세다. */
const patchPetTicketExpiry = async ({ petId, ticketId, body }: PatchPetTicketExpiryParams) => {
  const response = await api
    .patch(`owner/pets/${encodeURIComponent(petId)}/tickets/${encodeURIComponent(ticketId)}/expiry`, { json: body })
    .json();
  return parsePetTicketDetail(response);
};

export {
  deletePetTicket,
  deletePetTicketHold,
  getPetTicket,
  getPetTicketHistory,
  getPetTickets,
  patchPetTicketExpiry,
  postPetTicket,
  postPetTicketHold,
};
export type { PatchPetTicketExpiryParams, PostPetTicketHoldParams, PostPetTicketParams };
