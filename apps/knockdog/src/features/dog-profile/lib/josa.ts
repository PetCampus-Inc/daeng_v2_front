function getJongseongIndex(word: string): number | null {
  const lastChar = word.trim().at(-1);
  if (!lastChar) return null;

  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return null;

  return (code - 0xac00) % 28;
}

export function pickRoEuro(word: string): '로' | '으로' {
  const jongseongIndex = getJongseongIndex(word);
  // 받침 없음(0) 또는 ㄹ받침(8)일 때는 '로'
  return jongseongIndex === null || jongseongIndex === 0 || jongseongIndex === 8 ? '로' : '으로';
}

export function withRoEuro(word: string): string {
  return `${word}${pickRoEuro(word)}`;
}
