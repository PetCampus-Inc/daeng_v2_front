import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

const POST_SIGN_UP_REDIRECT_TTL_MS = 30 * 60 * 1000;

interface PostSignUpRedirect {
  pathname: string;
  expiresAt: number;
}

const postSignUpRedirectStorage = new TypedStorage<PostSignUpRedirect>(STORAGE_KEYS.POST_SIGN_UP_REDIRECT);

function isInternalPath(pathname: string): boolean {
  return pathname.startsWith('/') && !pathname.startsWith('//');
}

/** 신규 가입 완료 후 돌아갈 내부 경로를 저장한다. */
function savePostSignUpRedirect(pathname: string | undefined) {
  if (!pathname || !isInternalPath(pathname)) return;

  postSignUpRedirectStorage.set({
    pathname,
    expiresAt: Date.now() + POST_SIGN_UP_REDIRECT_TTL_MS,
  });
}

/** 신규 가입 완료 후 돌아갈 경로를 한 번만 꺼낸다. */
function consumePostSignUpRedirect(): string | null {
  const redirect = postSignUpRedirectStorage.get();
  postSignUpRedirectStorage.clear();

  if (!redirect || redirect.expiresAt < Date.now() || !isInternalPath(redirect.pathname)) return null;

  return redirect.pathname;
}

function clearPostSignUpRedirect() {
  postSignUpRedirectStorage.clear();
}

export { clearPostSignUpRedirect, consumePostSignUpRedirect, savePostSignUpRedirect };
