import { METHODS } from '../../rpc';
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
  [METHODS.setBlockingOverlay]: {
    params: {
      visible: boolean;
      message: string;
      /** 늦게 도착한 이전 표시 상태 요청을 무시하기 위한 단조 증가 순번 */
      requestId: number;
    };
    result: {
      visible: boolean;
    };
  };
}

export type { SystemRPCSchema };
