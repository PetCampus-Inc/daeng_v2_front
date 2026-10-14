/** 문의 작성자가 선택한 사용자 유형 */
type InquiryUserType = 'GUARDIAN' | 'OWNER';

/** WAITING: 답변 대기, ANSWERED: 답변 도착, RESOLVED: 해결 완료 */
type InquiryStatus = 'WAITING' | 'ANSWERED' | 'RESOLVED';

type InquiryMessageSender = 'USER' | 'OPERATOR';

// `GET` 내 문의 목록

interface InquiryListItemDto {
  id: number;
  title: string;
  status: InquiryStatus;
  lastActivityAt: string;
}

interface InquiryListResponseDto {
  items: InquiryListItemDto[];
  /** hasNext가 false면 null */
  nextCursor: string | null;
  hasNext: boolean;
}

// `POST` 문의 등록

/** 업로드 URL로 올린 사진. 배열 순서가 표시 순서 */
interface InquiryImageRequestDto {
  tempKey: string;
  originalFilename: string;
}

interface InquiryCreateRequestDto {
  userType: InquiryUserType;
  title: string;
  body: string;
  images?: InquiryImageRequestDto[];
}

// `GET` 문의 상세. 문의 등록·추가 문의·문의 해결도 같은 형태로 응답

/** 사용자가 첨부한 메시지(최초 문의, 추가 문의)에만 있고, 사진이 없거나 운영자 답변이면 빈 배열. displayOrder 오름차순으로 표시 */
interface InquiryDetailImageDto {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface InquiryDetailMessageDto {
  id: number;
  sender: InquiryMessageSender;
  body: string;
  createdAt: string;
  images: InquiryDetailImageDto[];
}

interface InquiryDetailResponseDto {
  id: number;
  userType: InquiryUserType;
  title: string;
  status: InquiryStatus;
  lastActivityAt: string;
  messages: InquiryDetailMessageDto[];
}

// `POST` 추가 문의

/** body는 필수. 사진만 있고 내용이 없는 추가 문의는 불가 */
interface InquiryAdditionalRequestDto {
  body: string;
  images?: InquiryImageRequestDto[];
}

// `POST` 문의 이미지 업로드 URL 발급

interface InquiryUploadFileRequestDto {
  filename: string;
  contentType: string;
  size: number;
}

interface InquiryUploadUrlItemDto {
  tempKey: string;
  uploadUrl: string;
}

interface InquiryUploadUrlResponseDto {
  items: InquiryUploadUrlItemDto[];
}

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
};
