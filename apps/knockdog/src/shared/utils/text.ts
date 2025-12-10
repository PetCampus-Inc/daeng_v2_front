export const ellipsisText = (text: string, maxLength: number = 7, suffix = '…') => {
  return text.length > maxLength ? text.slice(0, maxLength) + suffix : text;
};

export const getSubjectParticle = (word: string): '이' | '가' => {
  if (!word || word.length === 0) {
    return '이';
  }

  const lastCharCode = word.charCodeAt(word.length - 1);

  // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3(가 ~ 힣)
  if (lastCharCode < 0xac00 || lastCharCode > 0xd7a3) {
    return '이';
  }

  const jongseong = (lastCharCode - 0xac00) % 28;
  const hasNoJongseong = jongseong === 0;

  if (hasNoJongseong) {
    return '가';
  }

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
