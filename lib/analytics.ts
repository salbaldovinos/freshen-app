/**
 * PostHog analytics wrapper.
 *
 * Every product-analytics call in the app goes through this module — never call
 * the PostHog SDK directly from a screen, store, or component.
 *
 * PII rule: event properties must never contain personally identifying or
 * user-authored content. Do NOT put animal names, breeding/birth notes, email
 * addresses, or photo data (URIs or bytes) in event properties. Identify a user
 * only by their opaque account id — never by email.
 */
import PostHog from 'posthog-react-native';

export type AnalyticsEvent =
  | 'breeding_record_created'
  | 'breeding_record_edited'
  | 'breeding_record_deleted'
  | 'pregnancy_confirmed'
  | 'birth_logged'
  | 'sort_order_changed'
  | 'paywall_viewed'
  | 'upgrade_tapped'
  | 'purchase_completed'
  | 'purchase_cancelled'
  | 'purchase_restored'
  | 'notification_permission_granted'
  | 'notification_permission_denied'
  | 'export_triggered'
  | 'photo_added'
  | 'photo_removed'
  | 'account_created'
  | 'account_deleted';

let client: PostHog | null = null;

export function initializeAnalytics(): void {
  if (__DEV__) return;
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (!apiKey) return;
  client = new PostHog(apiKey);
}

export function track(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!client) return;
  client.capture(event, properties);
}

export function identifyUser(userId: string): void {
  if (!client) return;
  client.identify(userId);
}

export function resetAnalyticsUser(): void {
  if (!client) return;
  client.reset();
}
