import { APP_NAME } from './app';

// Empty states
export const EMPTY_STATE_BREEDING_LIST = `No breeding records yet. Tap + to add your first entry.`;
export const EMPTY_STATE_BIRTH_HISTORY = 'No births logged yet.';

// Loading & error
export const LOADING_ERROR_RECORDS =
  'Something went wrong loading your records. Pull down to try again.';

// Form labels
export const LABEL_ANIMAL_NAME = 'Animal name';
export const LABEL_SIRE_NAME = 'Sire name';
export const LABEL_PAIRING_DATE = 'Pairing date';
export const LABEL_SPECIES = 'Species';
export const LABEL_GESTATION_DAYS = 'Gestation days';
export const LABEL_NOTES = 'Notes';
export const LABEL_COLOR_TAG = 'Color tag';
export const LABEL_BIRTH_DATE = 'Birth date';
export const LABEL_DOES_COUNT = 'Does (female)';
export const LABEL_BUCKS_COUNT = 'Bucks (male)';
export const LABEL_STILLBORN_COUNT = 'Stillborn';

// Form placeholders
export const PLACEHOLDER_ANIMAL_NAME = 'e.g. Daisy';
export const PLACEHOLDER_SIRE_NAME = 'e.g. Buck (optional)';
export const PLACEHOLDER_NOTES = 'Any notes (optional)';

// Form validation errors
export const ERROR_ANIMAL_NAME_REQUIRED = 'Animal name is required.';
export const ERROR_ANIMAL_NAME_MAX = 'Animal name must be 50 characters or less.';
export const ERROR_SIRE_NAME_MAX = 'Sire name must be 50 characters or less.';
export const ERROR_PAIRING_DATE_REQUIRED = 'Pairing date is required.';
export const ERROR_PAIRING_DATE_FUTURE = 'Pairing date cannot be in the future.';
export const ERROR_PAIRING_DATE_TOO_OLD = 'Pairing date cannot be more than 365 days ago.';
export const ERROR_GESTATION_DAYS_RANGE = 'Gestation days must be between 1 and 400.';
export const ERROR_NOTES_BREEDING_MAX = 'Notes must be 500 characters or less.';
export const ERROR_NOTES_BIRTH_MAX = 'Notes must be 300 characters or less.';
export const ERROR_BIRTH_DATE_BEFORE_PAIRING = 'Birth date cannot be before pairing date.';
export const ERROR_BIRTH_DATE_FUTURE = 'Birth date cannot be in the future.';
export const ERROR_OFFSPRING_REQUIRED = 'Please enter at least one offspring.';
export const ERROR_OFFSPRING_COUNT_HIGH = 'Offspring count seems high. Please double-check.';

// Success toasts
export const TOAST_RECORD_SAVED = 'Breeding record saved.';
export const TOAST_RECORD_DELETED = 'Record deleted.';
export const toastPregnancyConfirmed = (name: string) => `Pregnancy confirmed for ${name}.`;
export const toastBirthLogged = (name: string) => `Birth logged for ${name}.`;

// Card display
export const SIRE_UNKNOWN = 'Sire unknown';

// Header text
export const activeBreedingsCount = (count: number) =>
  `${count} active breeding${count === 1 ? '' : 's'}.`;

// Breeding detail
export const LABEL_DAYS_BRED = 'Days bred';
export const LABEL_DAYS_LEFT = 'Days left';
export const LABEL_DUE_DATE = 'Due date';

// Actions
export const ACTION_ADD_BREEDING = 'Add breeding';
export const ACTION_EDIT_ENTRY = 'Edit entry';
export const ACTION_MARK_PREGNANT = 'Mark pregnant';
export const ACTION_LOG_BIRTH = 'Log birth';
export const ACTION_LOG_ANOTHER_BIRTH = 'Log another birth';
export const ACTION_ARCHIVE = 'Archive';
export const ACTION_UNARCHIVE = 'Unarchive';
export const ACTION_DELETE = 'Delete';
export const ACTION_SAVE = 'Save';
export const ACTION_SAVE_CHANGES = 'Save changes';
export const ACTION_SAVE_BIRTH = 'Save birth record';

// Confirmation dialogs
export const CONFIRM_DELETE_TITLE = 'Delete record';
export const CONFIRM_DELETE_MESSAGE =
  'This will permanently delete this breeding record and all associated birth records. This action cannot be undone.';
export const CONFIRM_ARCHIVE_TITLE = 'Archive record';
export const CONFIRM_ARCHIVE_MESSAGE =
  'This will archive the breeding record. You can unarchive it later from the detail screen.';

// Tier limits
export const TIER_ANIMAL_LIMIT = `You've reached the 10-animal limit on the free plan. Upgrade to track unlimited animals.`;
export const TIER_SPECIES_LOCKED = 'Coming soon';
export const TIER_FEATURE_LOCKED = `Coming in ${APP_NAME} Pro`;

// Notifications
export const NOTIFICATION_7_DAYS_TITLE = 'Due date coming up';
export const notification7DaysBody = (name: string) => `${name} is due in 7 days.`;
export const NOTIFICATION_3_DAYS_TITLE = 'Due date coming up';
export const notification3DaysBody = (name: string) =>
  `${name} is due in 3 days. Prepare the birthing area.`;
export const NOTIFICATION_1_DAY_TITLE = 'Due date tomorrow';
export const notification1DayBody = (name: string) => `${name} is due tomorrow!`;
export const NOTIFICATION_DUE_TITLE = 'Due today';
export const notificationDueBody = (name: string) => `${name} is due today. Watch closely.`;
export const NOTIFICATION_OVERDUE_TITLE = 'Overdue';
export const notificationOverdueBody = (name: string) =>
  `${name} was due yesterday. No birth logged yet.`;

// Settings
export const SETTINGS_TITLE = 'Settings';
export const SETTINGS_ACCOUNT = 'Account';
export const SETTINGS_NOTIFICATIONS = 'Notifications';
export const SETTINGS_DATA = 'Data';
export const SETTINGS_ABOUT = 'About';
export const SETTINGS_PRIVACY_POLICY = 'Privacy policy';
export const SETTINGS_TERMS = 'Terms of service';
export const SETTINGS_VERSION = 'Version';
export const SETTINGS_CREATE_ACCOUNT = 'Create account';
export const SETTINGS_SIGN_IN = 'Sign in';
export const SETTINGS_EXPORT = 'Export my data';
export const SETTINGS_DUE_DATE_REMINDERS = 'Due date reminders';

// Sort options
export const SORT_DUE_DATE_ASC = 'Due date (soonest first)';
export const SORT_DUE_DATE_DESC = 'Due date (latest first)';
export const SORT_DATE_ADDED_NEWEST = 'Date added (newest first)';
export const SORT_DATE_ADDED_OLDEST = 'Date added (oldest first)';
export const SORT_NAME_AZ = 'Animal name (A\u2013Z)';
