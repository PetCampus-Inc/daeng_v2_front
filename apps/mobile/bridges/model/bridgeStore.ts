// import type { BridgeEventType } from '@knockdog/bridge-core';
// import { create } from 'zustand';

// type BridgeLog = { dir: 'in' | 'out'; type: string; payload?: unknown; t: number };

// type BridgeState = {
//   lastReceivedType: BridgeEventType | null;
//   payload?: unknown;
//   sendBridgeMessage: (type: BridgeEventType, payload?: unknown) => void;
//   logs: BridgeLog[];
//   addLog: (log: BridgeLog) => void;
// };

// export const useBridgeStore = create<BridgeState>((set, get) => ({
//   lastReceivedType: null,
//   payload: undefined,
//   logs: [],
//   addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),

//   sendBridgeMessage: (type, payload) => {
//     const msg = JSON.stringify({ type, payload });

//     // JS 주입으로 window에 message 이벤트 발생시킴
//     const js = `
//       (function(){
//         try {
//           window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify({ type, payload })} }));
//         } catch (e) {}
//       })();
//       true;
//     `;
//     (globalThis as any).webviewRef?.injectJavaScript?.(js);

//     get().addLog({ dir: 'out', type, payload, t: Date.now() });
//   },
// }));
