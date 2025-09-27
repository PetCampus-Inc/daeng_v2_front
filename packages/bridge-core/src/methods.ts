const METHODS = {
  getLatLng: 'device.getLatLng',
  callPhone: 'system.callPhone',
} as const;

export type MethodName = (typeof METHODS)[keyof typeof METHODS];

type CallPhoneParams = {
  phoneNumber: string;
};

type CallPhoneResult = {
  opened: boolean;
};
export { METHODS };
export type { CallPhoneParams, CallPhoneResult };
