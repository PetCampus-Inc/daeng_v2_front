import { formatInquiryDateTime, InquiryStatusBadge, type InquiryListItemDto } from '@entities/inquiry';

interface InquiryListItemProps {
  item: InquiryListItemDto;
  onClick: (item: InquiryListItemDto) => void;
}

/** 문의 목록 한 줄: 제목, 최근 활동일시, 상태 배지 */
function InquiryListItem({ item, onClick }: InquiryListItemProps) {
  // Figma 기준 높이 78px: 아래 구분선이 높이에 더해지지 않도록 안쪽 그림자로 그린다
  return (
    <button
      type='button'
      onClick={() => onClick(item)}
      className='bg-bg-0 gap-x5 p-x4 flex w-full items-center text-left shadow-[inset_0_-1px_0_0_var(--color-line-200)]'
    >
      <div className='gap-x1 flex min-w-0 flex-1 flex-col'>
        {/* @todo 긴 제목 표시 기준 확정 후 수정 (PRD OQ-P15). 임시로 한 줄 말줄임 */}
        <p className='body1-medium text-text-primary truncate'>{item.title}</p>
        <p className='label-medium text-fill-secondary-500'>{formatInquiryDateTime(item.lastActivityAt)}</p>
      </div>
      <InquiryStatusBadge status={item.status} />
    </button>
  );
}

export { InquiryListItem };
