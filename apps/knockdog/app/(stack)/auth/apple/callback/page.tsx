'use client';

/**
 * Apple Sign in Return URL.
 * usePopup 모드에서는 보통 opener JS 로 결과가 오지만,
 * Apple Console Return URL 등록/도메인 검증용으로 라우트가 필요하다.
 */
export default function AppleOAuthCallbackPage() {
  return (
    <main className='flex min-h-dvh items-center justify-center bg-white text-sm text-neutral-500'>
      Apple 로그인 처리 중…
    </main>
  );
}
