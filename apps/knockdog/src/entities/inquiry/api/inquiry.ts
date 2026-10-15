import { INQUIRY_PAGE_SIZE } from '../config/inquiry';
import { normalizeInquiryDateTime } from '../lib/normalizeInquiryDateTime';
import type {
  InquiryAdditionalRequestDto,
  InquiryCreateRequestDto,
  InquiryDetailResponseDto,
  InquiryListResponseDto,
  InquiryUploadFileRequestDto,
  InquiryUploadUrlResponseDto,
} from '../model/inquiry';

import { api, type ApiResponse } from '@shared/api';

/** 상세 응답의 일시를 문자열로 맞춤 */
function normalizeDetail(response: ApiResponse<InquiryDetailResponseDto>): ApiResponse<InquiryDetailResponseDto> {
  const detail = response.data;
  return {
    ...response,
    data: {
      ...detail,
      lastActivityAt: normalizeInquiryDateTime(detail.lastActivityAt),
      messages: detail.messages.map((message) => ({ ...message, createdAt: normalizeInquiryDateTime(message.createdAt) })),
    },
  };
}

/** 목록 응답의 일시를 문자열로 맞춤 */
function normalizeList(response: ApiResponse<InquiryListResponseDto>): ApiResponse<InquiryListResponseDto> {
  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map((item) => ({ ...item, lastActivityAt: normalizeInquiryDateTime(item.lastActivityAt) })),
    },
  };
}

interface GetInquiriesParams {
  cursor?: string;
  size?: number;
}

/** `GET` - 내 문의 목록. 보호자·원장 모드와 무관하게 계정 전체, 최근 활동일시 순. size 기본 20, 최대 50 */
function getInquiries({ cursor, size = INQUIRY_PAGE_SIZE }: GetInquiriesParams = {}) {
  return api
    .get('inquiries', {
      searchParams: {
        size,
        ...(cursor === undefined ? {} : { cursor }),
      },
    })
    .json<ApiResponse<InquiryListResponseDto>>()
    .then(normalizeList);
}

/** `POST` - 문의 등록. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
function postInquiry({ idempotencyKey, body }: { idempotencyKey: string; body: InquiryCreateRequestDto }) {
  return api
    .post('inquiries', {
      json: body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })
    .json<ApiResponse<InquiryDetailResponseDto>>()
    .then(normalizeDetail);
}

/** `GET` - 문의 상세 (메시지 스레드 포함) */
function getInquiryDetail(inquiryId: number) {
  return api.get(`inquiries/${inquiryId}`).json<ApiResponse<InquiryDetailResponseDto>>().then(normalizeDetail);
}

/** `POST` - 추가 문의. 사진은 선택, 최대 5장. 상태가 답변 대기로 바뀜. 해결된 문의는 409. 같은 Idempotency-Key 재시도는 최초 성공 응답 */
function postAdditionalInquiry({
  inquiryId,
  idempotencyKey,
  body,
}: {
  inquiryId: number;
  idempotencyKey: string;
  body: InquiryAdditionalRequestDto;
}) {
  return api
    .post(`inquiries/${inquiryId}/messages`, {
      json: body,
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
    })
    .json<ApiResponse<InquiryDetailResponseDto>>()
    .then(normalizeDetail);
}

/** `POST` - 문의 해결(종료). 이미 해결된 문의도 200. 이후 추가 문의 불가 */
function postResolveInquiry(inquiryId: number) {
  return api
    .post(`inquiries/${inquiryId}/resolve`)
    .json<ApiResponse<InquiryDetailResponseDto>>()
    .then(normalizeDetail);
}

/** `POST` - 문의 이미지 업로드 URL 발급. 최대 5개, 20MB 이하 JPG·JPEG·PNG·HEIC·HEIF */
function postInquiryImageUploadUrls(files: InquiryUploadFileRequestDto[]) {
  return api
    .post('inquiries/images/upload-urls', {
      json: { files },
    })
    .json<ApiResponse<InquiryUploadUrlResponseDto>>();
}

export {
  getInquiries,
  getInquiryDetail,
  postAdditionalInquiry,
  postInquiry,
  postInquiryImageUploadUrls,
  postResolveInquiry,
};
