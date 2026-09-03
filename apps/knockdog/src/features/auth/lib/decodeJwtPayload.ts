function decodeJwtPayload<T>(token: string): T {
  const payload = token.split('.')[1];
  if (!payload) throw new Error('Invalid JWT: missing payload');

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const json = atob(padded);

  return JSON.parse(json) as T;
}

export { decodeJwtPayload };
