import { getPetTicket, getPetTicketHistory, getPetTickets } from '../api/petTicket';
import { toPetTicketDetail, toPetTicketHistory, toPetTicketList } from '../model/petTicket';

const PET_TICKET_KEY = 'owner-pet-ticket';

const petTicketQueryKeys = {
  all: [PET_TICKET_KEY] as const,
  byPet: (petId: string) => [PET_TICKET_KEY, petId] as const,
  detail: (petId: string, ticketId: string) => [PET_TICKET_KEY, petId, ticketId] as const,
  history: (petId: string, ticketId: string) => [PET_TICKET_KEY, petId, ticketId, 'history'] as const,
};

const createPetTicketQueryOptions = (petId: string) => ({
  queryKey: petTicketQueryKeys.byPet(petId),
  queryFn: () => getPetTickets(petId),
  select: toPetTicketList,
});

const createPetTicketDetailOptions = (petId: string, ticketId: string) => ({
  queryKey: petTicketQueryKeys.detail(petId, ticketId),
  queryFn: () => getPetTicket(petId, ticketId),
  select: toPetTicketDetail,
});

const createPetTicketHistoryOptions = (petId: string, ticketId: string) => ({
  queryKey: petTicketQueryKeys.history(petId, ticketId),
  queryFn: () => getPetTicketHistory(petId, ticketId),
  select: toPetTicketHistory,
});

export { createPetTicketDetailOptions, createPetTicketHistoryOptions, createPetTicketQueryOptions, petTicketQueryKeys };
