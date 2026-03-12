import { METHODS } from '@knockdog/bridge-core';
import { WebBridge } from '../bridge/WebBridge';

class BridgeApi {
    constructor(private readonly bridge: WebBridge) {}

    getLngLat() {
        return this.bridge.request(METHODS.getLatLng)
    }
}

export { BridgeApi };