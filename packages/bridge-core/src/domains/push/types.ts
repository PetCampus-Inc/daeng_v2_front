interface PushDeviceRegistration {
  provider: 'FCM';
  platform: 'ANDROID' | 'IOS';
  token: string;
  supportedProvider: true;
}

export type { PushDeviceRegistration };
