export function isServer() {
  return typeof window === 'undefined' || 'Deno' in globalThis;
}
