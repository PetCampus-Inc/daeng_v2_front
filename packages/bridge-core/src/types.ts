type BridgeRequest = {
  id: string;
  type: 'request';
  method: string; // e.g. "device.getGeolocation"
  params?: unknown;
  meta: { v: string; source: 'web' | 'native'; ts: number };
};

type BridgeOk = {
  id: string;
  type: 'response';
  ok: true;
  result: unknown;
  meta: { v: string; source: 'web' | 'native'; ts: number };
};

type BridgeError = {
  id: string;
  type: 'response';
  ok: false;
  error: { code: string; message: string; details?: string };
  meta: { v: string; source: 'web' | 'native'; ts: number };
};

type BridgeEvent = {
  id: string;
  type: 'event';
  event: string;
  payload?: unknown;
  meta: { v: string; source: 'web' | 'native'; ts: number };
};

type BridgeMessage = BridgeRequest | BridgeOk | BridgeError | BridgeEvent;

export type { BridgeRequest, BridgeOk, BridgeError, BridgeEvent, BridgeMessage };
