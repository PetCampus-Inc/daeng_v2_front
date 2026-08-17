import { METHODS } from '../../rpc';
import type { PushDeviceRegistration } from './types';

interface PushRPCSchema {
  [METHODS.getPushToken]: {
    params: undefined;
    result: PushDeviceRegistration | null;
  };
}

export type { PushRPCSchema };
