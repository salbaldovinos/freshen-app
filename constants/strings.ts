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

// --- Auth (Feature 2.1) ---

// Welcome screen
export const AUTH_GET_STARTED = 'Get started free';
export const AUTH_SIGN_IN = 'Sign in';
export const AUTH_CONTINUE_WITHOUT_ACCOUNT = 'Continue without an account';

// Shared field labels / placeholders
export const AUTH_EMAIL_LABEL = 'Email';
export const AUTH_EMAIL_PLACEHOLDER = 'you@example.com';
export const AUTH_PASSWORD_LABEL = 'Password';
export const AUTH_PASSWORD_PLACEHOLDER = 'At least 8 characters';
export const AUTH_SHOW = 'Show';
export const AUTH_HIDE = 'Hide';

// Register screen
export const AUTH_CREATE_ACCOUNT_TITLE = 'Create your account';
export const AUTH_CREATE_ACCOUNT_BUTTON = 'Create account';
export const AUTH_HAVE_ACCOUNT_PROMPT = 'Already have an account?';

// Email verification step
export const AUTH_VERIFY_TITLE = 'Check your email';
export const authVerifySubtitle = (email: string) => `Enter the 6-digit code we sent to ${email}.`;
export const AUTH_CODE_LABEL = 'Verification code';
export const AUTH_CODE_PLACEHOLDER = '123456';
export const AUTH_VERIFY_BUTTON = 'Verify';
export const AUTH_RESEND_CODE = 'Resend code';
export const AUTH_CHANGE_EMAIL = 'Use a different email';

// Login screen
export const AUTH_SIGN_IN_TITLE = 'Welcome back';
export const AUTH_NO_ACCOUNT_PROMPT = "Don't have an account?";
export const AUTH_FORGOT_PASSWORD = 'Forgot password?';

// Forgot-password flow
export const AUTH_RESET_TITLE = 'Reset your password';
export const AUTH_RESET_EMAIL_SUBTITLE = "Enter your email and we'll send you a reset code.";
export const AUTH_SEND_RESET_CODE = 'Send reset code';
export const AUTH_RESET_CODE_SUBTITLE = 'Enter the code we emailed you and choose a new password.';
export const AUTH_NEW_PASSWORD_LABEL = 'New password';
export const AUTH_RESET_SUBMIT = 'Reset password';
export const AUTH_BACK_TO_SIGN_IN = 'Back to sign in';

// Auth error messages (PRD Feature 2.1 error table)
export const AUTH_ERROR_EMAIL_EXISTS =
  'An account with this email already exists. Sign in instead?';
export const AUTH_ERROR_EMAIL_INVALID = 'Please enter a valid email address.';
export const AUTH_ERROR_PASSWORD_SHORT = 'Password must be at least 8 characters.';
export const AUTH_ERROR_PASSWORD_NO_UPPERCASE =
  'Password must include at least one uppercase letter.';
export const AUTH_ERROR_PASSWORD_NO_NUMBER = 'Password must include at least one number.';
export const AUTH_ERROR_INCORRECT_CREDENTIALS = 'Incorrect email or password. Please try again.';
export const AUTH_ERROR_NOT_VERIFIED =
  'Please verify your email before signing in. Check your inbox.';
export const AUTH_ERROR_NETWORK =
  'Unable to connect. Check your internet connection and try again.';
export const AUTH_ERROR_SERVER = 'Something went wrong on our end. Please try again in a moment.';
export const AUTH_ERROR_SESSION_EXPIRED = 'Your session expired. Please sign in again.';
// Not in the PRD table \u2014 copy invented for the code-based (not link-based) verification flow.
export const AUTH_ERROR_CODE_INCORRECT = 'That code is incorrect. Please check and try again.';
// Not in the PRD table \u2014 Clerk rejects breached passwords (form_password_pwned).
export const AUTH_ERROR_PASSWORD_PWNED =
  'This password has appeared in a data breach. Please choose a different one.';

/**
 * Maps a Clerk error `code` to the PRD Feature 2.1 error copy. Codes not tied to a
 * specific field (or unrecognized) fall back to the generic server message; thrown
 * exceptions (no code) are treated as network errors by the caller.
 */
export function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'form_identifier_exists':
      return AUTH_ERROR_EMAIL_EXISTS;
    case 'form_param_format_invalid':
      return AUTH_ERROR_EMAIL_INVALID;
    case 'form_password_length_too_short':
      return AUTH_ERROR_PASSWORD_SHORT;
    case 'form_password_pwned':
      return AUTH_ERROR_PASSWORD_PWNED;
    case 'form_identifier_not_found':
    case 'form_password_incorrect':
      return AUTH_ERROR_INCORRECT_CREDENTIALS;
    case 'identifier_not_verified':
    case 'form_identifier_not_verified':
      return AUTH_ERROR_NOT_VERIFIED;
    case 'form_code_incorrect':
    case 'verification_failed':
    case 'verification_expired':
      return AUTH_ERROR_CODE_INCORRECT;
    default:
      return AUTH_ERROR_SERVER;
  }
}

// Paywall (PRD Feature 2.2)
export const PAYWALL_HEADLINE = `Upgrade to ${APP_NAME} Pro`;
export const PAYWALL_FEATURE_UNLIMITED = 'Unlimited animals';
export const PAYWALL_FEATURE_SYNC = 'Cloud backup & sync';
export const PAYWALL_FEATURE_EXTRAS = 'Photos, export & analytics';
export const PAYWALL_TRIAL_BADGE = '7-day free trial';
export const PAYWALL_CTA_START_TRIAL = 'Start free trial';
export const PAYWALL_RESTORE = 'Restore purchases';
export const PAYWALL_DISMISS = 'No thanks';
export const PAYWALL_LOADING = 'Loading plans';
export const PAYWALL_ERROR = 'Plans could not be loaded. Check your connection and try again.';

// Species picker premium badge (PRD Feature 2.2)
export const TIER_SPECIES_PREMIUM_BADGE = 'Premium';

// Purchase errors (PRD Feature 2.6)
export const PURCHASE_ERROR_NETWORK = 'Purchase failed — check your connection and try again.';
export const PURCHASE_ERROR_UNAVAILABLE =
  "This plan isn't available in your region. Contact support.";
export const PURCHASE_ERROR_ALREADY_OWNED =
  "You already have an active subscription. Tap 'Restore purchases' to access it.";
export const PURCHASE_ERROR_GENERIC =
  'Purchase could not be completed. Please try again or contact support.';

// Restore results (PRD Feature 2.6)
export const RESTORE_SUCCESS = 'Purchase restored successfully.';
export const RESTORE_NONE_FOUND =
  'No active purchases found. If you believe this is an error, contact support.';
export const RESTORE_ERROR = 'Restore failed. Check your connection and try again.';

// Cloud sync status indicator (PRD Feature 2.3)
export const SYNC_STATUS_SYNCED = 'Synced';
export const SYNC_STATUS_SYNCING = 'Syncing';
export const SYNC_STATUS_OFFLINE = 'Offline';
export const SYNC_SHEET_TITLE = 'Cloud sync';
export const SYNC_LAST_SYNCED_LABEL = 'Last synced';
export const SYNC_NEVER_SYNCED = 'Not synced yet.';
export const SYNC_OFFLINE_MESSAGE =
  'Working offline — your data is saved locally and will sync when you reconnect.';
