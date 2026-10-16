/** 경로의 문의 id. 양의 정수가 아니면 null */
function parseInquiryId(value: string | string[] | undefined) {
  const id = Number(value);
  return typeof value === 'string' && Number.isInteger(id) && id > 0 ? id : null;
}

export { parseInquiryId };
