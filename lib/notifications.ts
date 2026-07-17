import * as Notifications from 'expo-notifications';
import { isBefore, parseISO, set, subDays } from 'date-fns';

import { calculateDueDate, calculateDaysRemaining } from '@/lib/gestation';
import {
  NOTIFICATION_7_DAYS_TITLE,
  notification7DaysBody,
  NOTIFICATION_3_DAYS_TITLE,
  notification3DaysBody,
  NOTIFICATION_1_DAY_TITLE,
  notification1DayBody,
  NOTIFICATION_DUE_TITLE,
  notificationDueBody,
} from '@/constants/strings';

/**
 * Days before the due date at which a reminder fires. `0` is the due date itself.
 * Order matters only for readability; each maps to one scheduled notification.
 */
const REMINDER_OFFSETS = [7, 3, 1, 0] as const;

/** Local hour of day (24h) at which reminders are delivered. */
const TRIGGER_HOUR = 9;

type BreedingRecord = {
  id: string;
  animalName: string;
  pairingDate: string;
  gestationDays: number;
};

/**
 * Request notification permission from the OS.
 * Returns immediately as granted if permission was already granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const response = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return response.granted;
}

/**
 * Schedule the four due-date reminders (7d, 3d, 1d before, and on the due date)
 * for a breeding record. Triggers that fall in the past are skipped.
 */
export async function scheduleBreedingNotifications(record: BreedingRecord): Promise<void> {
  const dueDate = parseISO(calculateDueDate(record.pairingDate, record.gestationDays));
  const now = new Date();

  for (const offset of REMINDER_OFFSETS) {
    const triggerDate = set(subDays(dueDate, offset), {
      hours: TRIGGER_HOUR,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    if (isBefore(triggerDate, now)) {
      continue;
    }

    const { title, body } = reminderContent(offset, record.animalName);
    await Notifications.scheduleNotificationAsync({
      identifier: notificationIdentifier(record.id, offset),
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
}

/** Cancel every reminder previously scheduled for a breeding record. */
export async function cancelBreedingNotifications(breedingRecordId: string): Promise<void> {
  await Promise.all(
    REMINDER_OFFSETS.map((offset) =>
      Notifications.cancelScheduledNotificationAsync(
        notificationIdentifier(breedingRecordId, offset),
      ),
    ),
  );
}

/** Cancel all scheduled notifications across every record. */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Pick the single record a free-tier user should get reminders for: the one with
 * the soonest due date that is not already past (today counts as eligible).
 * Ties resolve to the record appearing first in the input array. Pure function.
 */
export function pickFreeTierRecord(
  records: { id: string; pairingDate: string; gestationDays: number }[],
): string | null {
  let bestId: string | null = null;
  let bestDaysRemaining = Infinity;

  for (const record of records) {
    const dueDate = calculateDueDate(record.pairingDate, record.gestationDays);
    const daysRemaining = calculateDaysRemaining(dueDate);
    if (daysRemaining < 0) {
      continue;
    }
    if (daysRemaining < bestDaysRemaining) {
      bestDaysRemaining = daysRemaining;
      bestId = record.id;
    }
  }

  return bestId;
}

function notificationIdentifier(breedingRecordId: string, daysBefore: number): string {
  return `breeding-${breedingRecordId}-${daysBefore}`;
}

function reminderContent(daysBefore: number, animalName: string): { title: string; body: string } {
  switch (daysBefore) {
    case 7:
      return { title: NOTIFICATION_7_DAYS_TITLE, body: notification7DaysBody(animalName) };
    case 3:
      return { title: NOTIFICATION_3_DAYS_TITLE, body: notification3DaysBody(animalName) };
    case 1:
      return { title: NOTIFICATION_1_DAY_TITLE, body: notification1DayBody(animalName) };
    default:
      return { title: NOTIFICATION_DUE_TITLE, body: notificationDueBody(animalName) };
  }
}
