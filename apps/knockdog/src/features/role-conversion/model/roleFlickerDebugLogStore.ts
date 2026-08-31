// TEMP DEBUG: 원장/보호자 깜빡임 원인 파악용. 확인 끝나면 파일째 제거.
// mypageRoleViewStore(모듈 스코프)와 SyncNativeMainTabModeEffect(컴포넌트)가
// 같은 로그 피드에 남길 수 있도록 공용 store로 분리.

import { create } from 'zustand';

import { useUserStore } from '@entities/user';

const DEBUG_USER_IDS = ['KXQRFLWH'];

interface RoleFlickerDebugLogState {
  lines: string[];
  push: (line: string) => void;
}

const MAX_LINES = 40;

const useRoleFlickerDebugLogStore = create<RoleFlickerDebugLogState>((set) => ({
  lines: [],
  push: (line) =>
    set((state) => {
      const time = new Date().toISOString().slice(11, 23);
      return { lines: [...state.lines.slice(-(MAX_LINES - 1)), `${time} ${line}`] };
    }),
}));

function isRoleFlickerDebugUser() {
  const userId = useUserStore.getState().user?.userId;
  return !!userId && DEBUG_USER_IDS.includes(userId);
}

function pushRoleFlickerDebugLog(line: string) {
  if (!isRoleFlickerDebugUser()) return;
  useRoleFlickerDebugLogStore.getState().push(line);
}

export { useRoleFlickerDebugLogStore, pushRoleFlickerDebugLog, isRoleFlickerDebugUser };
