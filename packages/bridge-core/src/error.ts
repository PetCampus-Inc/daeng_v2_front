/**
 * 브릿지 에러 코드
 *
 * string 타입으로 정의하여 각 도메인(위치, 인증, 결제 등)에서
 * 자유롭게 에러 코드를 정의할 수 있도록 함.
 */
type BridgeErrorCode = string;

/**
 * 공통 에러 코드 상수
 *
 * 각 도메인은 별도 파일에서 자체 에러 코드를 정의하는 것을 권장
 */
const COMMON_ERROR_CODES = {
  TIMEOUT: 'ETIMEDOUT',
  NOT_FOUND: 'ENOTFOUND',
  CONN_REFUSED: 'ECONNREFUSED',
  CONN_RESET: 'ECONNRESET',
  PIPE: 'EPIPE',
  HOST_UNREACH: 'EHOSTUNREACH',
  ADDR_INUSE: 'EADDRINUSE',
  ACCESS: 'EACCES',
  PERMISSION: 'EPERMISSION',
  DESTROYED: 'EDESTROYED',
  UNKNOWN: 'EUNKNOWN',
  INVALID: 'EINVALID',
  UNAVAILABLE: 'EUNAVAILABLE',
} as const;

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
export { BridgeException, makeBridgeError, COMMON_ERROR_CODES };
