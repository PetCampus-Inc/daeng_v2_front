const MAX_DOG_NAME_LENGTH = 8;
const MAX_RELATIONSHIP_TEXT_LENGTH = 5;
const KOREAN_SYLLABLES_ONLY = /[^가-힣]/g;

function normalizeKoreanText(value: string, maxLength: number) {
  return value.replace(KOREAN_SYLLABLES_ONLY, '').slice(0, maxLength);
}

function normalizeDogName(value: string) {
  return normalizeKoreanText(value, MAX_DOG_NAME_LENGTH);
}

function normalizeRelationshipText(value: string) {
  return normalizeKoreanText(value, MAX_RELATIONSHIP_TEXT_LENGTH);
}

export {
  MAX_DOG_NAME_LENGTH,
  MAX_RELATIONSHIP_TEXT_LENGTH,
  normalizeDogName,
  normalizeRelationshipText,
};
