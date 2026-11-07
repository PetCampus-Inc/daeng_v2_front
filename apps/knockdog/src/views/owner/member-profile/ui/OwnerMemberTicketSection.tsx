'use client';

import { ChargeButton, TicketEmptyCard, TicketSectionLink, TicketSummaryCard } from '@knockdog/ui';

import { ownerMemberProfileContent } from '@views/owner/member-profile/config/ownerMemberProfileContent';
import { MOCK_OWNER_MEMBER_TICKETS } from '@views/owner/member-profile/model/ownerMemberTicket';

import { toOwnerMemberTicketView } from '@entities/owner-member';

import { route } from '@shared/constants/route';
import { useStackNavigation } from '@shared/lib/bridge';
import { toast } from '@shared/ui/toast';

interface OwnerMemberTicketSectionProps {
  petId: string;
}

function OwnerMemberTicketSection({ petId }: OwnerMemberTicketSectionProps) {
  const { push, pushForResult } = useStackNavigation();
  const tickets = MOCK_OWNER_MEMBER_TICKETS.map((ticket) => toOwnerMemberTicketView(ticket, new Date()));

  const handleCharge = async () => {
    try {
      const charged = await pushForResult<boolean>(
        { pathname: route.owner.members.detail.ticketCharge.root.replace('[id]', petId) },
        600_000
      );
      if (!charged) return;

      toast({
        type: 'success',
        shape: 'rounded',
        position: 'bottom',
        nativeTitle: ownerMemberProfileContent.ticketChargeSuccessToast,
        title: ownerMemberProfileContent.ticketChargeSuccessToast,
      });
    } catch {
      // 충전 화면에서 결과 없이 돌아온 경우
    }
  };

  return (
    <section className='flex flex-col gap-4 px-4 pt-9 pb-4'>
      <div className='flex items-center justify-between px-1'>
        <TicketSectionLink
          onClick={() => {
            push({ pathname: route.owner.members.detail.tickets.root.replace('[id]', petId) }).catch(() => undefined);
          }}
        />
        <ChargeButton
          onClick={() => {
            handleCharge().catch(() => undefined);
          }}
        />
      </div>
      {tickets.length === 0 ? (
        <TicketEmptyCard />
      ) : (
        tickets.map((ticket) => (
          <TicketSummaryCard
            key={ticket.id}
            title={ticket.name}
            status={ticket.status}
            remainingCount={ticket.remainingCount}
            totalCount={ticket.totalCount}
            period={ticket.period}
            remainingDays={ticket.remainingDays ?? undefined}
            className='cursor-pointer'
            onClick={() => {
              const pathname = route.owner.members.detail.tickets.detail.root
                .replace('[id]', petId)
                .replace('[ticketId]', ticket.id);
              push({ pathname }).catch(() => undefined);
            }}
          />
        ))
      )}
    </section>
  );
}

export { OwnerMemberTicketSection };
