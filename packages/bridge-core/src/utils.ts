function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const BRIDGE_VERSION = '1.0.0';

export { safeParse, makeId, BRIDGE_VERSION };
