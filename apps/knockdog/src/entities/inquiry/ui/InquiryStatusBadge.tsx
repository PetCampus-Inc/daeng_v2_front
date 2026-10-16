import { cva } from 'class-variance-authority';

import type { InquiryStatus } from '../model/inquiry';

const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  WAITING: '답변 대기',
  ANSWERED: '답변 도착',
  RESOLVED: '해결 완료',
};

// Figma 기준 60×26: 테두리는 크기에 더해지지 않도록 안쪽 ring으로 그리고, 줄 높이는 Figma의 18px을 쓴다 (caption1 토큰은 16px)
const inquiryStatusBadgeVariants = cva(
  'caption1-semibold radius-full px-x2 py-x1 inline-flex shrink-0 items-center justify-center leading-[18px] whitespace-nowrap',
  {
    variants: {
      status: {
        WAITING: 'bg-bg-0 ring-line-200 text-fill-secondary-500 ring-1 ring-inset',
        ANSWERED: 'bg-info-light text-info-bold',
        RESOLVED: 'bg-success-light text-success-bold',
      },
    },
  }
);

interface InquiryStatusBadgeProps {
  status: InquiryStatus;
}

/** 문의 상태 배지 (답변 대기 / 답변 도착 / 해결 완료). 목록과 상세에서 같이 씀 */
function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  return <span className={inquiryStatusBadgeVariants({ status })}>{INQUIRY_STATUS_LABEL[status]}</span>;
}

export { INQUIRY_STATUS_LABEL, InquiryStatusBadge };
