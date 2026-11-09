import { parseChargedPetTicket, parsePetTicketList, type PetTicketChargeRequest } from '../model/petTicket';import { api } from '@shared/api';

/** `GET` - 원생 이용권 목록. 필터 없이 전체와 상태별 개수를 받는다. */
const getPetTickets = async (petId: string) => {
  const response = await api.get(`owner/pets/${encodeURIComponent(petId)}/tickets`).json();
  return parsePetTicketList(response);
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

export { getPetTickets, postPetTicket };
export type { PostPetTicketParams };
