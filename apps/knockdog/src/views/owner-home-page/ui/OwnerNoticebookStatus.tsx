import { Icon } from '@knockdog/ui';

interface OwnerNoticebookStatusProps {
  isError?: boolean;
  pendingCount: number;
  sentCount: number;
}

const ERROR_MESSAGE = '정보를 불러오지 못했어요';

function OwnerNoticebookStatus({ isError = false, pendingCount, sentCount }: OwnerNoticebookStatusProps) {
  if (isError) {
    return (
      <div className='radius-r3 bg-bg-100 mx-4 flex h-[52px] items-center justify-start p-4 text-left'>
        <span className='body2-semibold text-text-secondary'>{ERROR_MESSAGE}</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className='radius-r3 border-line-accent bg-bg-0 mx-4 flex h-[52px] items-center justify-between border px-4 py-[10px]'>
        <div className='flex h-8 w-fit min-w-0 items-center gap-2'>
          <span className='radius-full bg-fill-primary-50 flex size-8 shrink-0 items-center justify-center p-2'>
            <Icon icon='Checklist' className='text-fill-primary-500 size-4' />
          </span>
          <div className='gap-x1 flex h-5 w-fit min-w-0 items-center'>
            <span className='body2-semibold text-text-primary whitespace-nowrap'>발송 전 알림장</span>
            <div className='flex h-5 min-w-0 items-center'>
              <span className='body2-extrabold text-text-accent whitespace-nowrap'>{pendingCount}건</span>
              <span className='body2-semibold text-text-primary whitespace-nowrap'>이 있어요</span>
            </div>
          </div>
        </div>
        <Icon icon='ChevronRight' className='text-fill-primary-500 size-6 shrink-0' />
      </div>
    );
  }

  return (
    <div className='radius-r3 bg-bg-100 mx-4 flex h-[52px] items-center gap-2 p-4'>
      <span className='flex size-4 shrink-0 items-center justify-center'>
        <Icon icon='Checklist' className='text-fill-secondary-400 size-4' />
      </span>
      <div className='gap-x1 flex h-5 w-fit min-w-0 items-center'>
        <span className='body2-semibold text-text-secondary whitespace-nowrap'>오늘</span>
        <div className='flex h-5 min-w-0 items-center'>
          <span className='body2-extrabold text-text-primary whitespace-nowrap'>{sentCount}건</span>
          <span className='body2-semibold text-text-secondary whitespace-nowrap'>의 알림장을 모두 발송했어요</span>
        </div>
      </div>
    </div>
  );
}

export { OwnerNoticebookStatus };
