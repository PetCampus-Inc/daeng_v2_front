function hasBatchim(word: string): boolean {
  const lastChar = word.trim().at(-1);
  if (!lastChar) return false;

  const code = lastChar.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;

  return (code - 0xac00) % 28 !== 0;
}

export function pickJosa(word: string, withBatchim: string, withoutBatchim: string): string {
  return hasBatchim(word) ? withBatchim : withoutBatchim;
}

export function withEulReul(word: string): string {
  return `${word}${pickJosa(word, '을', '를')}`;
}
