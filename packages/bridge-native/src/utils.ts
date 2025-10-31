import { type BridgeErrorCode, type BridgeErrorShape } from '@knockdog/bridge-core';

/** 어떤 에러든 표준 shape로 정규화 */
function normalizeError(err: unknown, fallback: { code?: BridgeErrorCode; message?: string } = {}): BridgeErrorShape {
  // 이미 shape를 만족
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const e = err as { code: string; message: string; data?: unknown; cause?: unknown };
    return {
      code: (e.code as BridgeErrorCode) ?? fallback.code ?? 'EUNKNOWN',
      message: String(e.message ?? fallback.message ?? 'unknown_error'),
      data: e.data,
      cause: e.cause,
    };
  }
  // Error 인스턴스
  if (err instanceof Error) {
    return {
      code: fallback.code ?? 'EUNKNOWN',
      message: err.message || fallback.message || 'unknown_error',
      cause: err,
    };
  }
  // 문자열/기타
  return {
    code: fallback.code ?? 'EUNKNOWN',
    message: fallback.message ?? String(err),
    data: err,
  };
}

/**
 * JSON.stringify 결과를 injectJavaScript에서 안전하게 사용할 수 있도록 이스케이프
 * - </script 태그 이스케이프
 * - U+2028 (Line Separator), U+2029 (Paragraph Separator) 이스케이프
 */
function serializeForJS(value: unknown): string {
  return JSON.stringify(value)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export { normalizeError, serializeForJS };
