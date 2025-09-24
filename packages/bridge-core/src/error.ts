type BridgeErrorCode =
  | 'ETIMEDOUT'
  | 'ENOTFOUND'
  | 'ECONNREFUSED'
  | 'ECONNRESET'
  | 'EPIPE'
  | 'EHOSTUNREACH'
  | 'EADDRINUSE'
  | 'EACCES'
  | 'EPERMISSION'
  | 'EDESTROYED'
  | 'EUNKNOWN';

interface BridgeErrorShape {
  code: BridgeErrorCode;
  message: string;
  data?: unknown;
  cause?: unknown;
}

class BridgeException extends Error implements BridgeErrorShape {
  code: BridgeErrorCode;
  data?: unknown;
  cause?: unknown;

  constructor(shape: BridgeErrorShape) {
    super(shape.message);
    this.name = 'BridgeError';
    this.code = shape.code;
    this.data = shape.data;
    this.cause = shape.cause;
  }
}

const makeBridgeError = (code: BridgeErrorCode, message: string, extra?: Partial<BridgeErrorShape>) =>
  new BridgeException({ code, message, ...extra });

export type { BridgeErrorCode, BridgeErrorShape };
export { BridgeException, makeBridgeError };
