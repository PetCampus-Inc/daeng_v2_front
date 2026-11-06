import { describe, expect, it } from 'vitest';

import { canSubmitInquiry, hasInquiryWriteInput } from './inquiryWriteForm';

const filled = { userType: 'GUARDIAN' as const, title: '알림이 오지 않아요', body: '확인 부탁드려요', photoCount: 0 };

describe('canSubmitInquiry', () => {
  it('사용자 유형·제목·내용이 모두 있으면 등록할 수 있다', () => {
    expect(canSubmitInquiry(filled)).toBe(true);
  });

  it('사용자 유형이 선택되지 않으면 등록할 수 없다', () => {
    expect(canSubmitInquiry({ ...filled, userType: null })).toBe(false);
  });

  it('제목이나 내용이 비어 있으면 등록할 수 없다', () => {
    expect(canSubmitInquiry({ ...filled, title: '' })).toBe(false);
    expect(canSubmitInquiry({ ...filled, body: '' })).toBe(false);
  });

  it('공백만 입력한 제목·내용은 빈 값으로 본다', () => {
    expect(canSubmitInquiry({ ...filled, title: '   ' })).toBe(false);
    expect(canSubmitInquiry({ ...filled, body: ' \n ' })).toBe(false);
  });

  it('사진 첨부 여부는 등록 조건에 영향이 없다', () => {
    expect(canSubmitInquiry({ ...filled, photoCount: 3 })).toBe(true);
    expect(canSubmitInquiry({ ...filled, title: '', photoCount: 3 })).toBe(false);
  });
});

describe('hasInquiryWriteInput', () => {
  const empty = { userType: 'GUARDIAN' as const, title: '', body: '', photoCount: 0 };

  it('사용자 유형 초기값만 있으면 입력값이 없는 것으로 본다', () => {
    expect(hasInquiryWriteInput(empty)).toBe(false);
    expect(hasInquiryWriteInput({ ...empty, userType: 'OWNER' })).toBe(false);
  });

  it('제목이나 내용을 입력하면 입력값이 있는 것으로 본다', () => {
    expect(hasInquiryWriteInput({ ...empty, title: '제목' })).toBe(true);
    expect(hasInquiryWriteInput({ ...empty, body: '내용' })).toBe(true);
  });

  it('글자가 없어도 사진이 있으면 입력값이 있는 것으로 본다', () => {
    expect(hasInquiryWriteInput({ ...empty, photoCount: 1 })).toBe(true);
  });
});
