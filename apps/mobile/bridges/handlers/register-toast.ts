// bridges/registerToastHandlers.ts
import { InteractionManager } from 'react-native';
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type ToastShowParams, type ToastDismissParams, type ToastClearParams } from '@knockdog/bridge-core';
import { toast } from '@/components/toast';

function registerToastHandlers(router: NativeBridgeRouter) {
  try {
    router.register<ToastShowParams, void>(METHODS.toastShow, (p) => {
      // 브릿지 핸들러 직후 Fabric 마운트 타이밍 충돌 방지 (viewState tag 에러)
      InteractionManager.runAfterInteractions(() => {
        toast({
          id: p.id,
          title: p.title,
          titleParts: p.titleParts,
          description: p.description,
          duration: p.duration,
          position: p.position,
          shape: p.shape,
          type: p.type,
          icon: p.icon,
          iconAccent: p.iconAccent,
        });
      });
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to show toast', details: error };
  }

  try {
    router.register<ToastDismissParams, void>(METHODS.toastDismiss, ({ id }) => {
      toast.dismiss(id);
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to dismiss toast', details: error };
  }

  try {
    router.register<ToastClearParams, void>(METHODS.toastClear, () => {
      toast.clear();
    });
  } catch (error) {
    throw { code: 'TOAST_ERROR', message: 'Failed to clear toast', details: error };
  }
}

export { registerToastHandlers };
