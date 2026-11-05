import { ChargeButton, TicketEmptyCard, TicketSectionLink } from '@knockdog/ui';

/** 원생 이용권 API가 연결되면 카드 목록으로 바꾼다. */
function OwnerMemberTicketSection() {
  return (
    <section className='flex flex-col gap-4 px-4 pt-9 pb-4'>
      <div className='flex items-center justify-between px-1'>
        <TicketSectionLink />
        <ChargeButton />
      </div>
      <TicketEmptyCard />
    </section>
  );
}

export { OwnerMemberTicketSection };
