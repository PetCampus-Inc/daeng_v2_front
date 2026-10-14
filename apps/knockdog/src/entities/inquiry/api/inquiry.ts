import { INQUIRY_PAGE_SIZE } from '../config/inquiry';
import type {
  InquiryAdditionalRequestDto,
  InquiryCreateRequestDto,
  InquiryDetailResponseDto,
  InquiryListResponseDto,
  InquiryUploadFileRequestDto,
  InquiryUploadUrlResponseDto,
} from '../model/inquiry';

import { api, type ApiResponse } from '@shared/api';

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
    .json<ApiResponse<InquiryListResponseDto>>();
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
    .json<ApiResponse<InquiryDetailResponseDto>>();
}

/** `GET` - 문의 상세 (메시지 스레드 포함) */
function getInquiryDetail(inquiryId: number) {
  return api.get(`inquiries/${inquiryId}`).json<ApiResponse<InquiryDetailResponseDto>>();
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
    .json<ApiResponse<InquiryDetailResponseDto>>();
}

/** `POST` - 문의 해결(종료). 이미 해결된 문의도 200. 이후 추가 문의 불가 */
function postResolveInquiry(inquiryId: number) {
  return api.post(`inquiries/${inquiryId}/resolve`).json<ApiResponse<InquiryDetailResponseDto>>();
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
