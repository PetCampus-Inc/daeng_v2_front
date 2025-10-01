import { METHODS, type CallPhoneParams, type CallPhoneResult, type ShareParams, type ShareResult } from './methods';

interface RPCSchema {
  [METHODS.getLatLng]: {
    params: {
      accuracy?: 'balanced' | 'high' | undefined;
    };
    result: {
      lat: number;
      lng: number;
    };
  };
  [METHODS.callPhone]: {
    params: CallPhoneParams;
    result: CallPhoneResult;
  };
  [METHODS.copyToClipboard]: {
    params: {
      text: string;
    };
    result: {
      copied: boolean;
    };
  };
  [METHODS.share]: {
    params: ShareParams;
    result: ShareResult;
  };
  [METHODS.navPush]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
    result: {
      pushed: boolean;
    };
  };
  [METHODS.navBack]: {
    params: {};
    result: {
      wentBack: boolean;
    };
  };
  [METHODS.navReplace]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
    result: {
      replaced: boolean;
    };
  };
  [METHODS.navReset]: {
    params: {
      name: string;
      params: Record<string, unknown>;
    };
    result: {
      reset: boolean;
    };
  };
}

type RPCMethod = keyof RPCSchema;
type ParamsOf<K extends RPCMethod> = RPCSchema[K]['params'];
type ResultOf<K extends RPCMethod> = RPCSchema[K]['result'];

export type { RPCSchema, RPCMethod, ParamsOf, ResultOf };
