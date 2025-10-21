// bridges/registerToastHandlers.ts
import { NativeBridgeRouter } from '@knockdog/bridge-native';
import { METHODS, type ToastShowParams, type ToastDismissParams, type ToastClearParams } from '@knockdog/bridge-core';
import { toast } from '@/components/toast';

function registerToastHandlers(router: NativeBridgeRouter) {
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

  router.register<ToastDismissParams, void>(METHODS.toastDismiss, ({ id }) => {
    toast.dismiss(id);
  });

  router.register<ToastClearParams, void>(METHODS.toastClear, () => {
    toast.clear();
  });
}

export { registerToastHandlers };
