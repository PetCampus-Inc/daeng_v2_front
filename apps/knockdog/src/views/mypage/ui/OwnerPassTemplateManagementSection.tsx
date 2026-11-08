import { Icon } from '@knockdog/ui';

interface OwnerPassTemplateManagementSectionProps {
  onClick: () => void;
}

function OwnerPassTemplateManagementSection({ onClick }: OwnerPassTemplateManagementSectionProps) {
  return (
    <section className='bg-bg-0 px-4 py-5'>
      <h2 className='h3-extrabold text-text-primary pb-3'>유치원 관리</h2>
      <button
        type='button'
        className='radius-r3 border-line-200 flex w-full items-center gap-3 border px-4 py-4 text-left'
        onClick={onClick}
      >
        <span className='bg-fill-secondary-50 flex size-11 shrink-0 items-center justify-center rounded-full'>
          <Icon icon='Ticket' className='text-fill-secondary-700 size-6' />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='body1-bold text-text-primary block'>이용권 관리</span>
          <span className='body2-regular text-text-tertiary block truncate'>
            자주 사용하는 이용권을 관리 할 수 있어요.
          </span>
        </span>
        <Icon icon='ChevronRight' className='text-text-tertiary size-5 shrink-0' />
      </button>
    </section>
  );
}

export { OwnerPassTemplateManagementSection };
