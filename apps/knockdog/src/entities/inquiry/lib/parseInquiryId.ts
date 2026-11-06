/** 경로의 문의 id. 양의 정수가 아니면 null */
function parseInquiryId(value: string | string[] | undefined) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

export { parseInquiryId };
