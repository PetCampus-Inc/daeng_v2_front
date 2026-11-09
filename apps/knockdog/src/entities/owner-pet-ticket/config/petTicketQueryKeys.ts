import { getPetTicket, getPetTickets } from '../api/petTicket';
import { toPetTicketDetail, toPetTicketList } from '../model/petTicket';

const PET_TICKET_KEY = 'owner-pet-ticket';

const petTicketQueryKeys = {
  all: [PET_TICKET_KEY] as const,
  byPet: (petId: string) => [PET_TICKET_KEY, petId] as const,
  detail: (petId: string, ticketId: string) => [PET_TICKET_KEY, petId, ticketId] as const,
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

export { createPetTicketDetailOptions, createPetTicketQueryOptions, petTicketQueryKeys };
