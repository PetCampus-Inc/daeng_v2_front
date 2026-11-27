// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import { filterSentryBreadcrumb, filterSentryEvent } from "./src/shared/lib/sentry/filterSentryEvent";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "development",
  enabled: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT === "production",
  tracesSampleRate: 0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0.05,

  // Turns off collection of data that could identify users. Adjust per category:
  // https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection
  dataCollection: {
    userInfo: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    httpBodies: [],
    httpHeaders: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    cookies: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    urlQueryParams: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
  },
  beforeSend: (event, hint) => {
    const hasOwnError = event.exception?.values?.some(
      (exception) => exception.type === "TypeError" && exception.value === "Object.hasOwn is not a function",
    );
    return hasOwnError ? null : filterSentryEvent(event, hint);
  },
  beforeBreadcrumb: filterSentryBreadcrumb,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
