import type { InquiryUserType } from '@entities/inquiry';

interface InquiryWriteFormValues {
  userType: InquiryUserType | null;
  title: string;
  body: string;
  photoCount: number;
}

/** [등록하기] 활성 조건: 사용자 유형·제목·내용 모두 필요. 공백만 입력한 값은 빈 값. 사진은 조건에 넣지 않는다 */
function canSubmitInquiry({ userType, title, body }: InquiryWriteFormValues) {
  return userType !== null && title.trim().length > 0 && body.trim().length > 0;
}

/** 이탈 확인 모달을 띄울 입력값이 있는지. 사용자 유형은 초기값이 있으므로 세지 않는다 */
function hasInquiryWriteInput({ title, body, photoCount }: InquiryWriteFormValues) {
  return title.length > 0 || body.length > 0 || photoCount > 0;
}

export { canSubmitInquiry, hasInquiryWriteInput };
export type { InquiryWriteFormValues };
