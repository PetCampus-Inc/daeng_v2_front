interface NavigationEventMap {
  'nav.result': { txId: string; result: unknown };
  'nav.cancel': { txId: string; reason?: string };
}

export type { NavigationEventMap };
