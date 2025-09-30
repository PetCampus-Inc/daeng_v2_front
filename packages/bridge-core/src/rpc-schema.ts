import { METHODS, type CallPhoneParams, type CallPhoneResult } from './methods';

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
}

type RPCMethod = keyof RPCSchema;
type ParamsOf<K extends RPCMethod> = RPCSchema[K]['params'];
type ResultOf<K extends RPCMethod> = RPCSchema[K]['result'];

export type { RPCSchema, RPCMethod, ParamsOf, ResultOf };
