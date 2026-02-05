import { METHODS } from '../../rpc';
import type { SafeAreaInsets } from './types';

interface SafeAreaRPCSchema {
  [METHODS.getSafeAreaInsets]: {
    params: {};
    result: SafeAreaInsets;
  };
}

export type { SafeAreaRPCSchema };
