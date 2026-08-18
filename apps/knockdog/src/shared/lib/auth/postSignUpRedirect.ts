import { STORAGE_KEYS } from '@shared/constants';
import { TypedStorage } from '@shared/lib/storage';

const POST_SIGN_UP_REDIRECT_TTL_MS = 30 * 60 * 1000;

interface PostSignUpRedirect {
  pathname: string;
  expiresAt: number;
}

const postSignUpRedirectStorage = new TypedStorage<PostSignUpRedirect>(STORAGE_KEYS.POST_SIGN_UP_REDIRECT);

/** 스택 파라미터로 전달받은 경로가 앱 내부 경로인지 확인한다. */
function getInternalRedirect(pathname: unknown): string | undefined {
  if (typeof pathname !== 'string' || !pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) {
    return undefined;
  }

  try {
    return new URL(pathname, 'https://knockdog.local').origin === 'https://knockdog.local' ? pathname : undefined;
  } catch {
    return undefined;
  }
}

/** 신규 가입 완료 후 돌아갈 내부 경로를 저장한다. */
function savePostSignUpRedirect(pathname: string | undefined) {
  const redirectTo = getInternalRedirect(pathname);
  if (!redirectTo) {
    postSignUpRedirectStorage.clear();
    return;
  }

  postSignUpRedirectStorage.set({
    pathname: redirectTo,
    expiresAt: Date.now() + POST_SIGN_UP_REDIRECT_TTL_MS,
  });
}

/** 신규 가입 완료 후 돌아갈 경로를 한 번만 꺼낸다. */
function consumePostSignUpRedirect(): string | null {
  const redirect = postSignUpRedirectStorage.get();
  postSignUpRedirectStorage.clear();

  if (!redirect || redirect.expiresAt < Date.now()) return null;

  return getInternalRedirect(redirect.pathname) ?? null;
}

function clearPostSignUpRedirect() {
  postSignUpRedirectStorage.clear();
}

export { clearPostSignUpRedirect, consumePostSignUpRedirect, getInternalRedirect, savePostSignUpRedirect };
