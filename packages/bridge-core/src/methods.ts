const METHODS = {
  getLatLng: 'device.getLatLng',
} as const;

export type MethodName = (typeof METHODS)[keyof typeof METHODS];

export { METHODS };
