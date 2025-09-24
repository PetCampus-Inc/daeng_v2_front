interface BridgeEventMap {
  'bridge.ready': { nativeVersion: string; methods: string[] };
  'device.getLatLng': { lat: number; lng: number };
}

export type { BridgeEventMap };
