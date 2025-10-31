import { create } from 'zustand';

import { BridgeEventType } from '../types/bridge';

type BridgeLog = {
  dir: 'in' | 'out';
  type: string;
  payload?: unknown;
  time: number;
};

type BridgeState = {
  lastReceivedType: BridgeEventType | null;
  payload?: unknown;
  sendBridgeMessage: (type: BridgeEventType, payload?: unknown) => void;
  logs: BridgeLog[];
  addLog: (log: BridgeLog) => void;
};

export const useBridgeStore = create<BridgeState>((set) => ({
  lastReceivedType: null,
  payload: undefined,
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

  sendBridgeMessage: (type, payload) => {
    const msg = JSON.stringify({ type, payload });
    window.ReactNativeWebView?.postMessage?.(msg);
    set((state) => ({
      logs: [...state.logs, { dir: 'out', type, payload, time: Date.now() }],
    }));
  },
}));
