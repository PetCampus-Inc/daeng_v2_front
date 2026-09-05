function decodeJwtPayload<T>(token: string): T {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid JWT: missing payload');

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  // atob는 binary string → UTF-8 디코드해야 한글 nickname 등이 깨지지 않음
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as T;
}

export { decodeJwtPayload };
