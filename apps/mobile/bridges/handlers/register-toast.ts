// bridges/registerToastHandlers.ts
import { InteractionManager } from 'react-native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type ToastShowParams, type ToastDismissParams, type ToastClearParams } from '@knockdog/bridge-core';
import { toast } from '@/components/toast';

type ToastCommand =
  | { type: 'show'; payload: ToastShowParams }
  | { type: 'dismiss'; id?: string }
  | { type: 'clear' };

const commandQueue: ToastCommand[] = [];
let isProcessingQueue = false;

function enqueueToastCommand(command: ToastCommand) {
  commandQueue.push(command);
  void processToastCommandQueue();
}

async function processToastCommandQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (commandQueue.length > 0) {
    const command = commandQueue.shift()!;

    if (command.type === 'show') {
      const payload = command.payload;
      // 브릿지 핸들러 직후 Fabric 마운트 타이밍 충돌 방지 (viewState tag 에러)
      await new Promise<void>((resolve) => {
        InteractionManager.runAfterInteractions(() => {
          toast({
            id: payload.id,
            title: payload.title,
            titleParts: payload.titleParts,
            description: payload.description,
            duration: payload.duration,
            position: payload.position,
            shape: payload.shape,
            type: payload.type,
            icon: payload.icon,
            iconAccent: payload.iconAccent,
          });
          resolve();
        });
      });
      continue;
    }

    if (command.type === 'dismiss') {
      toast.dismiss(command.id);
      continue;
    }

    toast.clear();
  }

  isProcessingQueue = false;
}

function registerToastHandlers(router: NativeBridgeRouter) {
  try {
    router.register<ToastShowParams, void>(METHODS.toastShow, (p) => {
      enqueueToastCommand({ type: 'show', payload: p });
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to show toast', details: error };
  }

  try {
    router.register<ToastDismissParams, void>(METHODS.toastDismiss, ({ id }) => {
      enqueueToastCommand({ type: 'dismiss', id });
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to dismiss toast', details: error };
  }

  try {
    router.register<ToastClearParams, void>(METHODS.toastClear, () => {
      enqueueToastCommand({ type: 'clear' });
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to clear toast', details: error };
  }
}

export { registerToastHandlers };
