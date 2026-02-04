import { METHODS } from '@/rpc';
import type { ToastShowParams, ToastDismissParams, ToastClearParams } from './types';

interface ToastRPCSchema {
  [METHODS.toastShow]: {
    params: ToastShowParams;
    result: void;
  };
  [METHODS.toastDismiss]: {
    params: ToastDismissParams;
    result: void;
  };
  [METHODS.toastClear]: {
    params: ToastClearParams;
    result: void;
  };
}

export type { ToastRPCSchema };