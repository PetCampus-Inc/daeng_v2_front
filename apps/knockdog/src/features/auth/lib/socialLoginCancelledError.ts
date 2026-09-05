/** 사용자가 소셜 로그인 UI를 닫았을 때 — toast/에러 오버레이 없이 silent return */
class SocialLoginCancelledError extends Error {
  readonly code = 'SOCIAL_LOGIN_CANCELLED' as const;

  constructor(message = 'Social login cancelled') {
    super(message);
    this.name = 'SocialLoginCancelledError';
  }
}

function isSocialLoginCancelled(error: unknown): error is SocialLoginCancelledError {
  return error instanceof SocialLoginCancelledError || (error instanceof Error && error.name === 'SocialLoginCancelledError');
}

export { SocialLoginCancelledError, isSocialLoginCancelled };
