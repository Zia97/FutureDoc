import * as Sentry from '@sentry/react-native';

export function reportError(scope, err, { level = 'warning', extra } = {}) {
  if (__DEV__) console.error(`[${scope}]`, err);

  Sentry.withScope((s) => {
    s.setTag('scope', scope);
    s.setLevel(level);
    if (extra) s.setExtras(extra);
    s.setFingerprint([scope, err?.message ?? 'unknown']);
    Sentry.captureException(err);
  });
}

export function reportMessage(scope, message, { level = 'warning', extra } = {}) {
  if (__DEV__) console.warn(`[${scope}]`, message, extra ?? '');

  Sentry.withScope((s) => {
    s.setTag('scope', scope);
    s.setLevel(level);
    if (extra) s.setExtras(extra);
    s.setFingerprint([scope, message]);
    Sentry.captureMessage(message);
  });
}
