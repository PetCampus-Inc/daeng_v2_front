import type { InquiryUserType } from '@entities/inquiry';

const INQUIRY_USER_TYPE_LABEL: Record<InquiryUserType, string> = {
  GUARDIAN: '보호자',
  OWNER: '원장',
};

interface InquiryUserTypeBadgeProps {
  userType: InquiryUserType;
}

/** 문의의 사용자 유형 배지 (보호자 / 원장). 줄 높이는 Figma 18px (caption1 토큰은 16px) */
function InquiryUserTypeBadge({ userType }: InquiryUserTypeBadgeProps) {
  return (
    <span className='caption1-semibold bg-fill-primary-50 text-text-accent radius-full px-x2 py-x1_5 inline-flex shrink-0 items-center leading-[18px] whitespace-nowrap'>
      {INQUIRY_USER_TYPE_LABEL[userType]}
    </span>
  );
}

export { InquiryUserTypeBadge };
