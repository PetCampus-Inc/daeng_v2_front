import { safeParse, type BridgeMessage } from '@knockdog/bridge-core'
import { isBridgeMessage } from './isBridgeMessage';


function parseBridgeMessage(input: unknown): BridgeMessage | null {
  const parsed = typeof input === 'string' ? safeParse(input) : input;

  if(!parsed) return null;
  if(!isBridgeMessage(parsed)) return null;

  return parsed
}

export { parseBridgeMessage };