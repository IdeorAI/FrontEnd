// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Adiciona requestId aos eventos do Sentry
    const requestId = localStorage.getItem('currentRequestId');
    if (requestId) {
      event.tags = event.tags || {};
      event.tags.request_id = requestId;
    }
    return event;
  }
});
