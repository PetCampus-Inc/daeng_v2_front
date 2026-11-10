import { getGuardianTicketCard, getGuardianTicketDetail, getGuardianTicketManage } from '../api/guardianTicket';
import { toGuardianTicketCard, toGuardianTicketDetail, toGuardianTicketManage } from '../model/guardianTicket';

const GUARDIAN_TICKET_KEY = 'guardian-ticket';

const guardianTicketQueryKeys = {
  all: [GUARDIAN_TICKET_KEY] as const,
  card: (petId: string) => [GUARDIAN_TICKET_KEY, 'card', petId] as const,
  manage: (petId: string) => [GUARDIAN_TICKET_KEY, 'manage', petId] as const,
  detail: (petId: string, ticketId: string) => [GUARDIAN_TICKET_KEY, 'detail', petId, ticketId] as const,
};

const createTicketCardOptions = (petId: string) => ({
  queryKey: guardianTicketQueryKeys.card(petId),
  queryFn: () => getGuardianTicketCard(petId),
  select: toGuardianTicketCard,
});

const createTicketManageOptions = (petId: string) => ({
  queryKey: guardianTicketQueryKeys.manage(petId),
  queryFn: () => getGuardianTicketManage(petId),
  select: toGuardianTicketManage,
});

const createTicketDetailOptions = (petId: string, ticketId: string) => ({
  queryKey: guardianTicketQueryKeys.detail(petId, ticketId),
  queryFn: () => getGuardianTicketDetail(petId, ticketId),
  select: toGuardianTicketDetail,
});

export { createTicketCardOptions, createTicketDetailOptions, createTicketManageOptions, guardianTicketQueryKeys };
