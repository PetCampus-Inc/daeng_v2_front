const MEMO_MAX_CONTENT_LENGTH = 2000;
const MEMO_MAX_PHOTO_COUNT = 5;

function countMemoCharacters(value: string) {
  return Array.from(value).length;
}

function truncateMemoContent(value: string, maxLength = MEMO_MAX_CONTENT_LENGTH) {
  return Array.from(value).slice(0, maxLength).join('');
}

function normalizeMemoContent(value: string) {
  return value.trim();
}

export {
  countMemoCharacters,
  MEMO_MAX_CONTENT_LENGTH,
  MEMO_MAX_PHOTO_COUNT,
  normalizeMemoContent,
  truncateMemoContent,
};
