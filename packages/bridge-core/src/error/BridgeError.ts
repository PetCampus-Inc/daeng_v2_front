import type { BridgeErrorCode, BridgeErrorShape } from './types';

class BridgeException extends Error implements BridgeErrorShape {
  code: BridgeErrorCode;
  data?: unknown;
  declare cause?: unknown;

  constructor(shape: BridgeErrorShape) {
    super(shape.message, shape.cause !== undefined ? { cause: shape.cause } : undefined);
    this.name = 'BridgeError';
    this.code = shape.code;
    this.data = shape.data;
    this.cause = shape.cause;

    if ((Error as any).captureStackTrace) {
      (Error as any).captureStackTrace(this, BridgeException);
    }
  }
}

type Extra = Omit<Partial<BridgeErrorShape>, 'code' | 'message'>;

const makeBridgeError = (code: BridgeErrorCode, message: string, extra?: Extra) =>
  new BridgeException({ code, message, ...extra });


export { BridgeException, makeBridgeError };
