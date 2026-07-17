import * as Notifications from 'expo-notifications';

import {
  requestPermissions,
  scheduleBreedingNotifications,
  cancelBreedingNotifications,
  cancelAllNotifications,
  pickFreeTierRecord,
} from '@/lib/notifications';
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

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date' },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

const getPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
const requestPermissionsAsync = Notifications.requestPermissionsAsync as jest.Mock;
const scheduleNotificationAsync = Notifications.scheduleNotificationAsync as jest.Mock;
const cancelScheduledNotificationAsync =
  Notifications.cancelScheduledNotificationAsync as jest.Mock;
const cancelAllScheduledNotificationsAsync =
  Notifications.cancelAllScheduledNotificationsAsync as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  scheduleNotificationAsync.mockResolvedValue('scheduled-id');
  cancelScheduledNotificationAsync.mockResolvedValue(undefined);
  cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
});

/** Map every scheduleNotificationAsync call by its notification identifier. */
function scheduledByIdentifier(): Map<
  string,
  { content: { title: string; body: string }; trigger: { type: string; date: Date } }
> {
  const map = new Map();
  for (const [request] of scheduleNotificationAsync.mock.calls) {
    map.set(request.identifier, request);
  }
  return map;
}

describe('requestPermissions', () => {
  it('returns true without prompting when permission is already granted', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: true });

    await expect(requestPermissions()).resolves.toBe(true);
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('prompts and returns true when the user grants permission', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: false });
    requestPermissionsAsync.mockResolvedValue({ granted: true });

    await expect(requestPermissions()).resolves.toBe(true);
    expect(requestPermissionsAsync).toHaveBeenCalledWith({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
  });

  it('returns false when the user denies permission', async () => {
    getPermissionsAsync.mockResolvedValue({ granted: false });
    requestPermissionsAsync.mockResolvedValue({ granted: false });

    await expect(requestPermissions()).resolves.toBe(false);
  });
});

describe('scheduleBreedingNotifications', () => {
  // Daisy: paired 2026-01-01, goat gestation 150 → due 2026-05-31.
  const record = {
    id: 'rec1',
    animalName: 'Daisy',
    pairingDate: '2026-01-01',
    gestationDays: 150,
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules 4 reminders with correct identifiers, content, and trigger dates', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-01T08:00:00'));

    await scheduleBreedingNotifications(record);

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(4);
    const scheduled = scheduledByIdentifier();

    const seven = scheduled.get('breeding-rec1-7')!;
    expect(seven.content).toEqual({
      title: NOTIFICATION_7_DAYS_TITLE,
      body: notification7DaysBody('Daisy'),
    });
    expect(seven.trigger.type).toBe(Notifications.SchedulableTriggerInputTypes.DATE);
    expect(seven.trigger.date.getTime()).toBe(new Date(2026, 4, 24, 9, 0, 0, 0).getTime());

    const three = scheduled.get('breeding-rec1-3')!;
    expect(three.content).toEqual({
      title: NOTIFICATION_3_DAYS_TITLE,
      body: notification3DaysBody('Daisy'),
    });
    expect(three.trigger.date.getTime()).toBe(new Date(2026, 4, 28, 9, 0, 0, 0).getTime());

    const one = scheduled.get('breeding-rec1-1')!;
    expect(one.content).toEqual({
      title: NOTIFICATION_1_DAY_TITLE,
      body: notification1DayBody('Daisy'),
    });
    expect(one.trigger.date.getTime()).toBe(new Date(2026, 4, 30, 9, 0, 0, 0).getTime());

    const due = scheduled.get('breeding-rec1-0')!;
    expect(due.content).toEqual({
      title: NOTIFICATION_DUE_TITLE,
      body: notificationDueBody('Daisy'),
    });
    expect(due.trigger.date.getTime()).toBe(new Date(2026, 4, 31, 9, 0, 0, 0).getTime());
  });

  it('skips triggers already in the past', async () => {
    // Now is midday the day before due: only the due-date (offset 0) trigger is still future.
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-30T12:00:00'));

    await scheduleBreedingNotifications(record);

    expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(scheduleNotificationAsync.mock.calls[0][0].identifier).toBe('breeding-rec1-0');
  });

  it('schedules nothing when the entire due window is in the past', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-15T08:00:00'));

    await scheduleBreedingNotifications(record);

    expect(scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('cancelBreedingNotifications', () => {
  it('cancels all four reminder identifiers for the record', async () => {
    await cancelBreedingNotifications('rec1');

    expect(cancelScheduledNotificationAsync).toHaveBeenCalledTimes(4);
    const cancelled = cancelScheduledNotificationAsync.mock.calls.map(([id]) => id);
    expect(new Set(cancelled)).toEqual(
      new Set(['breeding-rec1-7', 'breeding-rec1-3', 'breeding-rec1-1', 'breeding-rec1-0']),
    );
  });
});

describe('cancelAllNotifications', () => {
  it('cancels every scheduled notification once', async () => {
    await cancelAllNotifications();

    expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('pickFreeTierRecord', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-18T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null for an empty list', () => {
    expect(pickFreeTierRecord([])).toBeNull();
  });

  it('picks the record with the soonest future due date', () => {
    const id = pickFreeTierRecord([
      { id: 'later', pairingDate: '2026-03-01', gestationDays: 60 }, // due 2026-04-30
      { id: 'soon', pairingDate: '2026-03-01', gestationDays: 30 }, // due 2026-03-31
    ]);
    expect(id).toBe('soon');
  });

  it('treats a due-today record as eligible', () => {
    const id = pickFreeTierRecord([
      { id: 'future', pairingDate: '2026-03-01', gestationDays: 30 }, // due 2026-03-31
      { id: 'today', pairingDate: '2026-03-08', gestationDays: 10 }, // due 2026-03-18 (today)
    ]);
    expect(id).toBe('today');
  });

  it('breaks ties in favor of the first record in the array', () => {
    const id = pickFreeTierRecord([
      { id: 'first', pairingDate: '2026-03-01', gestationDays: 30 }, // due 2026-03-31
      { id: 'second', pairingDate: '2026-03-16', gestationDays: 15 }, // due 2026-03-31
    ]);
    expect(id).toBe('first');
  });

  it('returns null when every due date is already past', () => {
    const id = pickFreeTierRecord([
      { id: 'p1', pairingDate: '2025-01-01', gestationDays: 30 }, // due 2025-01-31
      { id: 'p2', pairingDate: '2025-06-01', gestationDays: 10 }, // due 2025-06-11
    ]);
    expect(id).toBeNull();
  });
});
