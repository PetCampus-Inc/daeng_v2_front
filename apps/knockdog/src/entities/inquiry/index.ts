export {
  getInquiries,
  getInquiryDetail,
  postAdditionalInquiry,
  postInquiry,
  postInquiryImageUploadUrls,
  postResolveInquiry,
} from './api/inquiry';
export { inquiriesQueryKeys, useInquiriesInfiniteQuery } from './api/useInquiriesInfiniteQuery';
export { useInquiryDetailQuery } from './api/useInquiryDetailQuery';
export { useAdditionalInquiryMutation } from './api/useAdditionalInquiryMutation';
export { useCreateInquiryMutation } from './api/useCreateInquiryMutation';
export { useResolveInquiryMutation } from './api/useResolveInquiryMutation';
export { formatInquiryDateTime } from './lib/formatInquiryDateTime';
export { INQUIRY_STATUS_LABEL, InquiryStatusBadge } from './ui/InquiryStatusBadge';
export { InquiryImageScroller } from './ui/InquiryImageScroller';
export {
  INQUIRY_BODY_MAX_LENGTH,
  INQUIRY_ERROR_CODE,
  INQUIRY_IMAGE_MAX_COUNT,
  INQUIRY_PAGE_SIZE,
  INQUIRY_TITLE_MAX_LENGTH,
} from './config/inquiry';
export type {
  InquiryAdditionalRequestDto,
  InquiryCreateRequestDto,
  InquiryDetailImageDto,
  InquiryDetailMessageDto,
  InquiryDetailResponseDto,
  InquiryImageRequestDto,
  InquiryListItemDto,
  InquiryListResponseDto,
  InquiryMessageSender,
  InquiryStatus,
  InquiryUploadFileRequestDto,
  InquiryUploadUrlItemDto,
  InquiryUploadUrlResponseDto,
  InquiryUserType,
} from './model/inquiry';
