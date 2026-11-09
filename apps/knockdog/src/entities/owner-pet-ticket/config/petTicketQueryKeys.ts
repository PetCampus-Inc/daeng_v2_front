import { getPetTickets } from '../api/petTicket';
import { toPetTicketList } from '../model/petTicket';

const PET_TICKET_KEY = 'owner-pet-ticket';

const petTicketQueryKeys = {
  all: [PET_TICKET_KEY] as const,
  byPet: (petId: string) => [PET_TICKET_KEY, petId] as const,
};

const createPetTicketQueryOptions = (petId: string) => ({
  queryKey: petTicketQueryKeys.byPet(petId),
  queryFn: () => getPetTickets(petId),
  select: toPetTicketList,
});

export { createPetTicketQueryOptions, petTicketQueryKeys };
