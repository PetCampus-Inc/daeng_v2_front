import type { BridgeErrorShape } from '../error';

type BridgeSource = 'web' | 'native';

type BridgeMeta = {
  v: string; // bridge version
  source: BridgeSource;
  ts: number; // timestamp
};

type BridgeBase = {
  id: string;
  meta: BridgeMeta;
};

type BridgeResult<T = unknown> =
  | {
      ok: true;
      result: T;
    }
  | {
      ok: false;
      error: BridgeErrorShape;
    };

type BridgeRequest<M extends string = string, P = unknown> = BridgeBase & {
  type: 'request';
  method: M;
  params?: P;
};

type BridgeResponse<T = unknown> = BridgeBase & {
  type: 'response';
} & BridgeResult<T>;

type BridgeEvent<E extends string = string, P = unknown> = BridgeBase & {
  type: 'event';
  event: E;
  payload?: P;
};

type BridgeMessage = BridgeRequest | BridgeResponse | BridgeEvent;

export type { BridgeMessage, BridgeRequest };
