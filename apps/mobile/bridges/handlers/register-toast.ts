// bridges/registerToastHandlers.ts
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type ToastShowParams, type ToastDismissParams, type ToastClearParams } from '@knockdog/bridge-core';
import { toast } from '@/components/toast';

function registerToastHandlers(router: NativeBridgeRouter) {
  try {
    router.register<ToastShowParams, void>(METHODS.toastShow, (p) => {
      toast({
        id: p.id,
        title: p.title,
        description: p.description,
        duration: p.duration,
        position: p.position,
        shape: p.shape,
        type: p.type,
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
