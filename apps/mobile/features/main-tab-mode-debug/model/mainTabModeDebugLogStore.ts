import { create } from 'zustand';

// TEMP DEBUG: 원장/보호자 하단 탭 깜빡임 원인 파악용. 확인 끝나면 폴더째 제거.

interface MainTabModeDebugLogState {
  lines: string[];
  push: (line: string) => void;
}

const MAX_LINES = 20;

const useMainTabModeDebugLogStore = create<MainTabModeDebugLogState>((set) => ({
  lines: [],
  push: (line) =>
    set((state) => {
      const time = new Date().toISOString().slice(11, 23);
      return { lines: [...state.lines.slice(-(MAX_LINES - 1)), `${time} ${line}`] };
    }),
}));

/** 컴포넌트 밖(브릿지 핸들러 등)에서도 로그를 남길 수 있도록 store 밖에 노출 */
function pushMainTabModeDebugLog(line: string) {
  useMainTabModeDebugLogStore.getState().push(line);
}

export { useMainTabModeDebugLogStore, pushMainTabModeDebugLog };
