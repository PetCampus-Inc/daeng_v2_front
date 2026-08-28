export interface Storage {
  get(key: string): string | null;

  set(key: string, value: string): void;

  remove(key: string): void;

  clear(): void;
}

class MemoStorage implements Storage {
  private storage = new Map<string, string>();

  public get(key: string) {
    return this.storage.get(key) || null;
  }

  public set(key: string, value: string) {
    this.storage.set(key, value);
  }

  public remove(key: string) {
    this.storage.delete(key);
  }

  public clear() {
    this.storage.clear();
  }
}

class LocalStorage implements Storage {
  public static canUse(): boolean {
    const TEST_KEY = generateTestKey();

    // 사용자가 쿠키 차단을 하는 경우 LocalStorage '접근' 시에 예외가 발생합니다.
    try {
      localStorage.setItem(TEST_KEY, 'test');
      localStorage.removeItem(TEST_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  public get(key: string) {
    return localStorage.getItem(key);
  }

  public set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  public remove(key: string) {
    localStorage.removeItem(key);
  }

  public clear() {
    localStorage.clear();
  }
}

class SessionStorage implements Storage {
  public static canUse(): boolean {
    const TEST_KEY = generateTestKey();

    try {
      sessionStorage.setItem(TEST_KEY, 'test');
      sessionStorage.removeItem(TEST_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  public get(key: string) {
    return sessionStorage.getItem(key);
  }

  public set(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  public remove(key: string) {
    sessionStorage.removeItem(key);
  }

  public clear() {
    sessionStorage.clear();
  }
}

function generateTestKey() {
  return new Array(4)
    .fill(null)
    .map(() => Math.random().toString(36).slice(2))
    .join('');
}

export function generateStorage(): Storage {
  if (LocalStorage.canUse()) {
    return new LocalStorage();
  }
  return new MemoStorage();
}

function generateSessionStorage(): Storage {
  if (SessionStorage.canUse()) {
    return new SessionStorage();
  }
  return new MemoStorage();
}

/**
 * @docs https://www.slash.page/ko/libraries/common/storage/src/safeLocalStorage.i18n
 */
export const safeLocalStorage = generateStorage();

/**
 * 세션(앱 완전 종료 전까지) 동안만 유지되는 저장소.
 * 탭 전환 등 같은 세션 안에서의 네비게이션에는 값이 유지되지만,
 * 앱을 껐다 켜서 WebView가 새로 생성되면 초기화된다.
 */
export const safeSessionStorage = generateSessionStorage();
