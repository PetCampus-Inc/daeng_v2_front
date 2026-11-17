import { cn } from '@knockdog/ui/lib';

import { DisconnectTicket, type DisconnectTicketProps } from '../disconnect-ticket';

interface DisconnectSheetProps {
  title?: string;
  body?: string;
  tickets?: DisconnectTicketProps[];
  isScrollable?: boolean;
  showInquiry?: boolean;
  className?: string;
  onInquiry?: () => void;
  onConfirm?: () => void;
}

const DEFAULT_BODY = '아직 이용이 완료되지 않은 예약이 남아 있어요.\n예약이 이용 완료 상태가 되면 연결을 해제할 수 있어요.';

/** V4 / Bottom Sheet / Disconnect */
function DisconnectSheet({
  title = '아직 연결을 해제할 수 없어요.',
  body = DEFAULT_BODY,
  tickets = [{ kind: 'pass' }],
  isScrollable = false,
  showInquiry = true,
  className,
  onInquiry,
  onConfirm,
}: DisconnectSheetProps) {
  return (
    <div
      className={cn(
        'bg-bg-0 flex w-full flex-col overflow-hidden rounded-t-[24px] shadow-[0_-16px_10px_rgba(0,0,0,0.05)]',
        className
      )}
    >
      <div className='flex h-x8 w-full justify-center pt-x3'>
        <span className='bg-fill-secondary-400 h-x1 w-x9 rounded-full' />
      </div>
      <div className='pb-x3 flex w-full flex-col'>
        <div className='py-x3_5 pr-x5 pl-x6'>
          <h2 className='h3-extrabold text-text-primary'>{title}</h2>
        </div>
        <div className='px-x6 pt-x1 gap-x6 flex flex-col'>
          <p className='body1-regular text-text-secondary whitespace-pre-line'>{body}</p>
          <div className={cn('gap-x2_5 flex flex-col', isScrollable && 'max-h-[200px] overflow-y-auto pr-x2_5')}>
            {tickets.map((ticket, index) => (
              <DisconnectTicket key={`${ticket.kind ?? 'pass'}-${ticket.title ?? index}`} {...ticket} />
            ))}
          </div>
        </div>
      </div>
      <div className='p-x4 gap-x2 flex w-full'>
        {showInquiry ? (
          <button
            type='button'
            onClick={onInquiry}
            className='body1-bold border-line-accent text-text-accent radius-r3 h-x14 flex-1 border border-solid'
          >
            유치원에 문의
          </button>
        ) : null}
        <button
          type='button'
          onClick={onConfirm}
          className='body1-bold bg-fill-primary-500 text-text-primary-inverse radius-r3 h-x14 flex-1'
        >
          확인
        </button>
      </div>
    </div>
  );
}

export { DisconnectSheet };
export type { DisconnectSheetProps };
