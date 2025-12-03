import { getBridgeInstance } from './BridgeProvider';

function openSystemSetting() {
  const bridge = getBridgeInstance();

  if (!bridge) {
    throw new Error('Bridge not initialized');
  }

  bridge.emit('system.openSystemSetting', undefined);
}

export { openSystemSetting };
