export const ellipsisText = (text: string, maxLength: number = 7, suffix = '…') => {
  return text.length > maxLength ? text.slice(0, maxLength) + suffix : text;
};

function getLastHangulSyllable(word: string) {
  const chars = [...word.trim().normalize('NFC')];
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const code = chars[index]?.charCodeAt(0);
    if (code == null) continue;
    if (code >= 0xac00 && code <= 0xd7a3) return chars[index];
  }
  return null;
}

function getLastLatinLetter(word: string) {
  const chars = [...word.trim()];
  for (let index = chars.length - 1; index >= 0; index -= 1) {
    const char = chars[index];
    if (char && /[a-z]/i.test(char)) return char;
  }
  return null;
}

export const getSubjectParticle = (word: string): '이' | '가' => {
  const hangul = getLastHangulSyllable(word);
  if (hangul) {
    const jongseong = (hangul.charCodeAt(0) - 0xac00) % 28;
    return jongseong === 0 ? '가' : '이';
  }

  const latin = getLastLatinLetter(word);
  if (latin) return /[aeiouy]/i.test(latin) ? '가' : '이';

  return '이';
};

export const getDirectionParticle = (word: string): '로' | '으로' => {
  if (!word || word.length === 0) {
    return '으로';
  }

  const lastCharCode = word.charCodeAt(word.length - 1);

  if (lastCharCode < 0xac00 || lastCharCode > 0xd7a3) {
    return '으로';
  }

  const jongseong = (lastCharCode - 0xac00) % 28;
  const hasNoJongseong = jongseong === 0;

  // 8: 'ㄹ'
  if (hasNoJongseong || jongseong === 8) {
    return '로';
  }

  return '으로';
};
