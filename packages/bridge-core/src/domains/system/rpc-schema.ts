import { METHODS } from '@/rpc';
import type { ShareParams, ShareResult, CallPhoneParams, CallPhoneResult } from './types';

interface SystemRPCSchema {
  [METHODS.openSettings]: {
    params: {};
    result: { opened: boolean };
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
  [METHODS.callPhone]: {
    params: CallPhoneParams;
    result: CallPhoneResult;
  };
}

export type { SystemRPCSchema };