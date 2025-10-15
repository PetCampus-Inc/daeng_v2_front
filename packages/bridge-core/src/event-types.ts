interface BridgeEventMap {
  'bridge.ready': { nativeVersion: string; methods: string[] };
  'nav.result': { txId: string; result: unknown };
  'nav.cancel': { txId: string; reason?: string };
}

export type { BridgeEventMap };
