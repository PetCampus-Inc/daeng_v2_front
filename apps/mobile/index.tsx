import { registerRootComponent } from 'expo';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

import App from './App';
import { filterSentryData } from './lib/sentry/filterSentryData';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
  enabled: process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT === 'production',
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: (event) => filterSentryData(event),
  beforeBreadcrumb: (breadcrumb) => filterSentryData(breadcrumb),
});

Sentry.setTag('platform', Platform.OS);

registerRootComponent(Sentry.wrap(App));
