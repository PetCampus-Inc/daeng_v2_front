import { METHODS } from '../../rpc';
import { type GetAppVersionResult } from './types';

interface AppVersionRPCSchema {
  [METHODS.getAppVersion]: {
    params: {};
    result: GetAppVersionResult;
  };
}

export type { AppVersionRPCSchema };
