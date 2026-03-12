import type { BridgeMessage } from '@knockdog/bridge-core';

function isBridgeMessage(value: unknown): value is BridgeMessage {
  if (!value || typeof value !== 'object') return false;

  const msg = value as Record<string, unknown>;

  if(typeof msg.id !== 'string') return false;
  if(typeof msg.type !== 'string') return false;


  if(msg.type === 'request') {
    return typeof msg.method === 'string';
  }
  
  if(msg.type === 'response') {
    return true;
  }

  if(msg.type === 'event') {
    return typeof msg.event === 'string';
  }

  return false;
}

export { isBridgeMessage };