import { PASS_HISTORY, PassHistoryRow } from '@knockdog/ui';

import {
  formatHistoryEntry,
  groupTicketHistory,
  type TicketHistory,
} from '@views/guardian-reservation-page/lib/guardianTicketHistory';

function GuardianTicketHistoryList({ entries }: { entries: TicketHistory[] }) {
  const groups = groupTicketHistory(entries);

  return (
    <section className='bg-bg-0 px-x5 pb-x6 flex flex-col'>
      <p className='body2-bold text-text-caption flex h-x8 items-center pt-x2 pb-x1'>{`${entries.length}개의 내역`}</p>
      {groups.map((group) => (
        <div key={group.dateKey} className='border-line-100 pt-x5 pb-x2 flex flex-col border-t'>
          <p className='caption1-extrabold text-text-tertiary'>{group.label}</p>
          {group.entries.map((entry) => {
            const row = formatHistoryEntry(entry);

            return (
              <PassHistoryRow
                key={entry.id}
                kind={row.isVoided ? PASS_HISTORY.canceled : PASS_HISTORY.use}
                title={row.title}
                amount={row.amount}
                description={row.description}
              />
            );
          })}
        </div>
      ))}
    </section>
  );
}

export { GuardianTicketHistoryList };
