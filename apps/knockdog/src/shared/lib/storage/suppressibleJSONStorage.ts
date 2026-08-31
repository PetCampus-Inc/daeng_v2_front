import { createJSONStorage } from 'zustand/middleware';

/**
 * storage 이벤트로 다른 탭의 변경을 받아 그대로 store에 반영하면, zustand
 * persist가 그 반영마다 다시 localStorage.setItem을 호출한다. 이미 storage에
 * 있는 값을 그대로 되돌려 쓰는 것뿐이라도, 이 재기록이 다른 탭에서 또 storage
 * 이벤트로 잡혀 서로 반사하는 무한 핑퐁이 될 수 있다(실기기에서 확인됨 — 값이
 * 초당 수백 번 왕복).
 *
 * runWithoutPersisting으로 감싼 구간에서 store를 갱신하면 그 순간의 실제
 * localStorage 기록을 건너뛰어, 몇 개 탭이 얽혀있든 재전파 자체를 막는다.
 */
function createSuppressibleJSONStorage() {
  let suppressed = false;

  const storage = createJSONStorage(() => ({
    getItem: (name: string) => localStorage.getItem(name),
    setItem: (name: string, value: string) => {
      if (suppressed) return;
      localStorage.setItem(name, value);
    },
    removeItem: (name: string) => localStorage.removeItem(name),
  }));

  function runWithoutPersisting(fn: () => void) {
    suppressed = true;
    try {
      fn();
    } finally {
      suppressed = false;
    }
  }

  return { storage, runWithoutPersisting };
}

export { createSuppressibleJSONStorage };
