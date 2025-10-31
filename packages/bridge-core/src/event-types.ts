interface BridgeEventMap {
  'bridge.ready': { nativeVersion: string; methods: string[] };
  'nav.result': { txId: string; result: unknown };
  'nav.cancel': { txId: string; reason?: string };
  'ui.toast': {
    id?: string;
    title?: string;
    description?: string;
    duration?: number;
    variant?: 'rounded' | 'square';
    position?: 'top' | 'bottom' | 'bottom-above-nav';
  };
}

export type { BridgeEventMap };
