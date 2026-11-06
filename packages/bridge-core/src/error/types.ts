import type { CommonErrorCode } from './codes';

// 공통 코드는 자동완성 + 도메인 에러 확장 허용되도록
type BridgeErrorCode = CommonErrorCode | (string & {});

/**
 * code: 에러 코드
 * message: 에러 메시지
 * data: 에러 데이터
 * cause: 에러 원인 (원본 에러 인스턴스)
 */
interface BridgeErrorShape {
  code: BridgeErrorCode;
  message: string;
  data?: unknown;
  cause?: unknown;
}

export type { BridgeErrorCode, BridgeErrorShape };
