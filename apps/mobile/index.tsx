import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

import App from './App';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
  tracesSampleRate: 0,
});

Sentry.setTag('platform', Platform.OS);

registerRootComponent(Sentry.wrap(App));
