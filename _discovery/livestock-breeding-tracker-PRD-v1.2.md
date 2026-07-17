# Freshen — Product Requirements Document
**Version:** 1.2 | **Status:** Approved | **Last Updated:** 2026-03-18
**Scope:** MVP → v1.0 production launch on iOS and Android
**Primary build tool:** Claude Code
**App name:** Freshen | **Bundle ID:** `com.freshenapp.freshen` | **Domain:** freshenapp.com
**Dark mode:** Not supported in v1.0. The color system and design tokens are designed for light mode only.

---

## How to use this document

This PRD is structured for Claude Code development. Each feature section contains: functional flow (every state and transition), exact error messages, acceptance criteria in Given/When/Then format, data schemas, and a task checklist. **Do not start coding until you have read the relevant feature section in full.** The `CLAUDE.md` should be placed at the repo root.

---

## Part 1: MVP specification (weeks 1–4)

The MVP validates core UX on a single device with local storage only. No auth, no cloud, no payments. Target: goats only.

**MVP definition:** A user can add a breeding record, see a live countdown to the due date, mark pregnancy as confirmed, and log a birth. Data persists on-device. App works with no internet connection.

**What MVP explicitly does NOT include:**
- Authentication or user accounts
- Cloud sync or backup
- Push notifications  
- Multi-species support
- Photo uploads
- Monetization

---

### Feature 1.1 — Breeding list (home screen)

#### Functional flow

**Initial state (no records):**  
Screen shows app name centered at top, a large empty-state illustration (goat + calendar icon), and the copy: "No breeding records yet. Tap + to add your first entry." A floating action button (+) is visible bottom-right.

**Main state (records exist):**  
List of `BreedingCard` components, sorted by due date ascending (soonest first) by default. Sort preference persists in `AsyncStorage`. Active/overdue entries appear before archived entries. Header shows total active record count: "3 active breedings."

**Sort options** (accessible via sort icon, top-right):
- Due date (ascending) — default
- Due date (descending)
- Date added (newest first)
- Date added (oldest first)
- Animal name (A–Z)

**BreedingCard displays:**
- Animal name (bold, 18px)
- Sire name (if entered), shown as "× [sire name]" or "Sire unknown" in muted text
- Days bred counter: "Day 47" — updates in real time using the device clock
- Due date: "Due Mar 15" 
- Status badge (see Status badge spec below)
- If overdue: red "OVERDUE" banner across top of card

**Status badge states:**

| Status | Color | Label | Condition |
|---|---|---|---|
| Bred | Yellow | "Bred" | Pairing recorded, pregnancy not confirmed |
| Pregnant | Green | "Pregnant" | `confirmedPregnant = true` |
| Overdue | Red | "Overdue" | Today > dueDate, no birth logged |
| Birth Logged | Blue | "Birth Logged" | Birth record exists |
| Archived | Gray | "Archived" | `archived = true` |

**Pull-to-refresh:** Triggers re-query of local SQLite. Shows spinner. No network call in MVP.

**Long-press on card** opens action sheet with:
- "Edit Entry"
- "Mark Pregnant" (only if `confirmedPregnant = false`)
- "Log Birth"
- "Archive" (only if no birth logged)
- "Delete" (destructive, red)

#### Acceptance criteria

```gherkin
Given I open the app for the first time
Then I see the empty state with copy "No breeding records yet. Tap + to add your first entry."
And the + button is visible

Given I have 3 breeding records
When I open the home screen
Then records are sorted by due date ascending by default
And each card shows animal name, days bred, due date, and status badge

Given a breeding record's due date has passed with no birth logged
Then the card shows a red "OVERDUE" banner
And the status badge shows "Overdue" in red

Given I long-press a card with confirmedPregnant = false
Then the action sheet includes "Mark Pregnant"

Given I long-press a card with a birth logged
Then the action sheet does NOT include "Archive"
And the action sheet does NOT include "Mark Pregnant"
```

#### States the UI must handle

- **Empty:** No records — show empty state illustration + copy
- **Loading:** SQLite query in progress — show skeleton cards (3 gray placeholder cards)
- **Populated:** Normal list state
- **Error:** SQLite read error — show "Something went wrong loading your records. Pull down to try again."

---

### Feature 1.2 — Add / edit breeding entry

#### Functional flow

**Initial state (Add mode):**  
Screen title: "Add Breeding." All fields empty except Species, which defaults to "Goat," and Pairing Date, which defaults to today.

**Initial state (Edit mode):**  
Screen title: "Edit Breeding." All fields pre-populated from existing record. Save button reads "Save Changes."

**Form fields:**

| Field | Type | Required | Validation | Placeholder |
|---|---|---|---|---|
| Animal Name (dam) | Text | Yes | 1–50 chars, no leading/trailing whitespace | "e.g. Daisy" |
| Sire Name | Text | No | 0–50 chars | "e.g. Buck (optional)" |
| Pairing Date | Date picker | Yes | Cannot be in the future; cannot be more than 365 days ago | — |
| Species | Picker | Yes | Must be value from SPECIES_CONFIG | Goat (default) |
| Gestation Days | Number | Yes | 1–400 integer | Auto-filled from species default |
| Notes | Textarea | No | 0–500 chars | "Any notes (optional)" |
| Color / Tag | Color swatch picker | No | One of 8 preset colors | Default: gray |

**Gestation days auto-fill behavior:**  
When Species changes, Gestation Days auto-fills with the species default from `SPECIES_CONFIG`. If the user has manually edited Gestation Days, show a confirmation: "Update gestation days to [species default] for [species name]?" with "Update" and "Keep [current value]" buttons.

**Due date preview:**  
Below the Pairing Date and Gestation Days fields, show a live preview: "Estimated due date: March 15, 2026" — updates in real time as those fields change.

**Save behavior:**
1. Validate all fields (client-side via Zod)
2. On validation failure: highlight offending fields with red border, show inline error below field
3. On success: write to SQLite via Drizzle, navigate back to list, show success toast: "Breeding record saved."
4. On SQLite error: show error toast: "Failed to save. Please try again."

**Delete (Edit mode only):**  
"Delete Record" button at bottom, red text, no icon. Tap → confirmation dialog: "Delete this breeding record? This cannot be undone." with "Delete" (red) and "Cancel." On confirm → delete from SQLite, navigate back to list, show toast: "Record deleted."

#### Error messages (exact copy)

| Condition | Message location | Message |
|---|---|---|
| Animal name empty | Below field | "Animal name is required." |
| Animal name too long | Below field | "Animal name must be 50 characters or less." |
| Pairing date in future | Below field | "Pairing date cannot be in the future." |
| Pairing date > 365 days ago | Below field | "Pairing date cannot be more than a year ago." |
| Gestation days not a number | Below field | "Please enter a valid number." |
| Gestation days out of range | Below field | "Gestation days must be between 1 and 400." |
| Notes too long | Below field, character count shown | "Notes must be 500 characters or less. ([current]/500)" |

#### Acceptance criteria

```gherkin
Given I open Add Breeding
Then Species defaults to "Goat"
And Pairing Date defaults to today
And Gestation Days auto-fills to 150

Given I change Species to "Sheep"
Then Gestation Days auto-updates to 147
And the due date preview updates immediately

Given I enter a pairing date of tomorrow
When I tap Save
Then Pairing Date field shows error "Pairing date cannot be in the future."
And no record is saved

Given all required fields are valid
When I tap Save
Then the record is written to SQLite
And I am navigated back to the list
And a toast reads "Breeding record saved."
And the new card appears in the list sorted by due date

Given I am in Edit mode
When I tap "Delete Record" and confirm
Then the record is removed from SQLite
And I am navigated back to the list
And a toast reads "Record deleted."
```

#### Data schema

```typescript
// db/schema.ts
export const breedingRecords = sqliteTable('breeding_records', {
  id: text('id').primaryKey(),                          // UUID v4
  animalName: text('animal_name').notNull(),            // 1–50 chars
  sireName: text('sire_name'),                          // nullable
  pairingDate: text('pairing_date').notNull(),          // ISO 8601 date string "YYYY-MM-DD"
  species: text('species').notNull(),                   // key from SPECIES_CONFIG
  gestationDays: integer('gestation_days').notNull(),   // 1–400
  notes: text('notes'),                                 // nullable, max 500 chars
  color: text('color').notNull().default('gray'),       // one of 8 preset values from COLOR_TAGS
  photoUrl: text('photo_url'),                           // nullable; Supabase Storage signed URL or local path
  confirmedPregnant: integer('confirmed_pregnant', { mode: 'boolean' }).notNull().default(false),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),              // ISO 8601 datetime
  updatedAt: text('updated_at').notNull(),              // ISO 8601 datetime
  userId: text('user_id'),                              // null in MVP; set when auth added
  syncedAt: text('synced_at'),                          // null until synced to cloud
});
```

---

### Feature 1.3 — Gestation calculation logic

This is the most critical business logic. It lives entirely in `lib/gestation.ts`. No date math outside this file.

#### Functions required

```typescript
// lib/gestation.ts

/**
 * Calculate due date from pairing date and gestation length.
 * @param pairingDate - ISO date string "YYYY-MM-DD"
 * @param gestationDays - integer, 1–400
 * @returns ISO date string "YYYY-MM-DD"
 */
export function calculateDueDate(pairingDate: string, gestationDays: number): string

/**
 * Calculate how many days have elapsed since pairing date.
 * Returns 0 if pairingDate is today.
 * Returns negative values if pairingDate is somehow in the future (should not happen after validation).
 * @param pairingDate - ISO date string "YYYY-MM-DD"
 * @returns integer (days elapsed, 0 or positive in normal operation)
 */
export function calculateDaysBred(pairingDate: string): number

/**
 * Calculate days remaining until due date.
 * Returns positive value if due date is in the future.
 * Returns 0 if due today.
 * Returns negative value (days overdue) if past due date.
 * @param dueDate - ISO date string "YYYY-MM-DD"
 * @returns integer
 */
export function calculateDaysRemaining(dueDate: string): number

/**
 * Determine the display status of a breeding record.
 * @returns 'bred' | 'pregnant' | 'overdue' | 'birth_logged' | 'archived'
 */
export function getBreedingStatus(record: {
  confirmedPregnant: boolean;
  dueDate: string;
  hasBirth: boolean;
  archived: boolean;
}): BreedingStatus
```

#### Acceptance criteria (unit test targets)

```
calculateDueDate("2026-01-01", 150) → "2026-05-31"
calculateDaysBred("2026-01-01") when today is "2026-03-01" → 59
calculateDaysRemaining("2026-03-20") when today is "2026-03-18" → 2
calculateDaysRemaining("2026-03-18") when today is "2026-03-18" → 0
calculateDaysRemaining("2026-03-16") when today is "2026-03-18" → -2

getBreedingStatus({ confirmedPregnant: false, dueDate: future, hasBirth: false, archived: false }) → 'bred'
getBreedingStatus({ confirmedPregnant: true, dueDate: future, hasBirth: false, archived: false }) → 'pregnant'
getBreedingStatus({ confirmedPregnant: true, dueDate: past, hasBirth: false, archived: false }) → 'overdue'
getBreedingStatus({ hasBirth: true, archived: false, ...any }) → 'birth_logged'
getBreedingStatus({ archived: true, ...any }) → 'archived'
```

**IMPORTANT:** All date logic must use date-fns (already included with Expo). Do NOT use `new Date()` arithmetic directly. Use `differenceInCalendarDays`, `addDays`, and `parseISO` from date-fns. This prevents timezone-related off-by-one errors.

#### Due date — derived, not stored

`dueDate` is **always calculated** from `pairingDate + gestationDays` using `calculateDueDate()`. There is no `dueDate` column in the schema. This prevents stale data if `gestationDays` is edited.

**Sorting by due date** requires computing the due date for each record before sorting. In the query layer (`db/queries/breeding.ts`), fetch all records, compute `dueDate` via `calculateDueDate()`, and sort in-memory. For the expected dataset size (tens to low hundreds of records per user), this is performant. If performance becomes an issue at scale, a stored `dueDate` column can be added via migration.

**Passing `dueDate` to functions:** When calling `getBreedingStatus()` or `calculateDaysRemaining()`, always compute the due date first:
```typescript
const dueDate = calculateDueDate(record.pairingDate, record.gestationDays);
const status = getBreedingStatus({ ...record, dueDate, hasBirth });
```

---

### Feature 1.4 — Confirm pregnancy

**Trigger:** Long-press card → "Mark Pregnant" OR button on breeding detail screen.

**Behavior:**
1. Immediately updates `confirmedPregnant = true` in SQLite
2. `updatedAt` is set to current timestamp
3. Status badge changes from "Bred" (yellow) to "Pregnant" (green) without navigation
4. Show inline toast: "Pregnancy confirmed for [animal name]."
5. No undo. If user needs to revert, they must edit the record.

**Edge case:** If record is already `confirmedPregnant = true`, the "Mark Pregnant" option does not appear in the action sheet.

#### Acceptance criteria

```gherkin
Given a card with status "Bred"
When I long-press and tap "Mark Pregnant"
Then the status badge changes to "Pregnant" (green) immediately
And a toast shows "Pregnancy confirmed for [animal name]."
And on next app launch, the record still shows "Pregnant"

Given a card with status "Pregnant"
When I long-press the card
Then "Mark Pregnant" does NOT appear in the action sheet
```

---

### Feature 1.5 — Log birth

#### Functional flow

**Access:** Long-press card → "Log Birth" OR via birth logging screen at `birth/[breedingId]`.

**Screen layout:**
- Title: "Log Birth — [Animal Name]"
- Birth Date picker (defaults to today; cannot be before pairing date; cannot be in the future)
- Offspring count fields:
  - "Does (female)" — number input, 0–20, default 0
  - "Bucks (male)" — number input, 0–20, default 0
  - "Stillborn" — number input, 0–20, default 0
- Notes — textarea, 0–300 chars
- "Save Birth Record" button

**Validation:**  
Total offspring (does + bucks + stillborn) must be ≥ 1. Show error below the offspring section: "Please enter at least one offspring."

**Save behavior:**
1. Validate fields
2. Write `births` record to SQLite linked to `breedingRecordId`
3. Navigate back to list
4. Toast: "Birth logged for [animal name]."
5. Status badge on card updates to "Birth Logged" (blue)

**Multiple births:** A single breeding record can have multiple birth log entries (e.g., if a kid was born but a second was missed and logged later). Show all birth records on the breeding detail screen in a list.

#### Error messages

| Condition | Message |
|---|---|
| Birth date before pairing date | "Birth date cannot be before the pairing date." |
| Birth date in future | "Birth date cannot be in the future." |
| All offspring counts are 0 | "Please enter at least one offspring." |
| Any count > 20 | "Offspring count seems high. Please double-check." |

#### Data schema

```typescript
export const births = sqliteTable('births', {
  id: text('id').primaryKey(),
  breedingRecordId: text('breeding_record_id').notNull()
    .references(() => breedingRecords.id, { onDelete: 'cascade' }),
  birthDate: text('birth_date').notNull(),    // ISO date string "YYYY-MM-DD"
  doesCount: integer('does_count').notNull().default(0),
  bucksCount: integer('bucks_count').notNull().default(0),
  stillbornCount: integer('stillborn_count').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  userId: text('user_id'),
  syncedAt: text('synced_at'),
});
```

#### Acceptance criteria

```gherkin
Given I open the Log Birth screen for a record with pairing date 2026-01-01
When I enter birth date 2025-12-31
Then I see error "Birth date cannot be before the pairing date."
And Save is disabled

Given I enter does=1, bucks=0, stillborn=0
When I tap Save
Then a birth record is written to SQLite
And the card status badge changes to "Birth Logged"
And a toast reads "Birth logged for [animal name]."

Given I enter does=0, bucks=0, stillborn=0
When I tap Save
Then I see error "Please enter at least one offspring."
And the record is not saved
```

---

### Feature 1.6 — Species configuration

```typescript
// constants/species.ts
export const SPECIES_CONFIG: Record<string, SpeciesConfig> = {
  goat: {
    label: 'Goat',
    gestationDays: 150,
    offspringTermDoe: 'Doe',
    offspringTermBuck: 'Buck',
  },
  sheep: {
    label: 'Sheep',
    gestationDays: 147,
    offspringTermDoe: 'Ewe lamb',
    offspringTermBuck: 'Ram lamb',
  },
  pig: {
    label: 'Pig',
    gestationDays: 114,
    offspringTermDoe: 'Gilt',
    offspringTermBuck: 'Boar piglet',
  },
  cattle: {
    label: 'Cattle',
    gestationDays: 283,
    offspringTermDoe: 'Heifer calf',
    offspringTermBuck: 'Bull calf',
  },
  horse: {
    label: 'Horse',
    gestationDays: 340,
    offspringTermDoe: 'Filly',
    offspringTermBuck: 'Colt',
  },
  donkey: {
    label: 'Donkey',
    gestationDays: 365,
    offspringTermDoe: 'Jenny foal',
    offspringTermBuck: 'Jack foal',
  },
  rabbit: {
    label: 'Rabbit',
    gestationDays: 31,
    offspringTermDoe: 'Doe kit',
    offspringTermBuck: 'Buck kit',
  },
};
```

**Note for MVP:** The species picker is present in the form UI but only "Goat" is selectable in the MVP build. Non-goat species are visible but disabled with a "Coming soon" label. The full `SPECIES_CONFIG` is built out now so the v1.0 multi-species unlock is trivial — remove the disabled state and add the tier gate.

---

### Feature 1.7 — Breeding detail screen

#### Functional flow

**Access:** Tap on any `BreedingCard` on the home screen list.

**Screen layout:**

```
[Header]
  ← Back button (navigates to list)
  Screen title: [Animal Name]
  Edit button (top-right, navigates to Edit form pre-populated)

[Photo section — v1.0 only, paid tier]
  If photo exists: full-width image (16:9 aspect ratio, rounded corners)
  If no photo (paid tier): camera icon with "Add photo" label
  If free tier: camera icon with lock badge

[Status section]
  Status badge (same as card: Bred / Pregnant / Overdue / Birth Logged / Archived)
  "Mark Pregnant" button (only if status = Bred)
    → On tap: confirm pregnancy immediately, toast, badge updates in-place

[Stats row]
  Days Bred | Days Left | Due Date
  (Same layout as card stats, Cormorant display numbers)

[Info section]
  Sire: "[Sire Name]" or "Sire unknown" (muted)
  Species: "[Species label]"
  Pairing Date: "[formatted date]"
  Gestation: "[N] days"
  Color tag: [color dot] [color name]

[Notes section — only if notes exist]
  Section header: "Notes"
  Notes text body

[Birth history section]
  Section header: "Births" with count badge: "(2)"
  If no births: "No births logged yet." with "Log Birth" button
  If births exist: list of birth summary cards, each showing:
    Birth date
    Offspring summary: "1 doe, 2 bucks" (using species-specific terms from SPECIES_CONFIG)
    Stillborn count (only if > 0, muted text)
    Birth notes (truncated to 2 lines, expandable)
  "Log Another Birth" button at bottom of list

[Actions section — bottom of scroll]
  "Archive" button (secondary, only if no birth logged and not archived)
  "Delete Record" button (destructive, red text)
```

**Mark Pregnant from detail screen:**
Same behavior as long-press action sheet (Feature 1.4). Button disappears after confirmation. Status badge updates immediately.

#### States the UI must handle

- **Loading:** Show skeleton layout while SQLite query runs
- **Populated:** Normal state with all sections
- **Error:** "Something went wrong loading this record." with "Go Back" button
- **Deleted externally:** If record was deleted (e.g., via sync conflict), show "This record no longer exists." with "Go Back" button

#### Acceptance criteria

```gherkin
Given I tap on a breeding card for "Daisy" with status "Bred"
Then I see the detail screen with title "Daisy"
And the "Mark Pregnant" button is visible
And the stats row shows Days Bred, Days Left, and Due Date

Given I tap "Mark Pregnant" on the detail screen
Then the status badge changes to "Pregnant" immediately
And the "Mark Pregnant" button disappears
And a toast shows "Pregnancy confirmed for Daisy."

Given the record has 2 birth log entries
Then the Births section shows "(2)" badge
And both birth summaries are visible with species-specific offspring terms

Given the record has no births logged
Then the Births section shows "No births logged yet."
And a "Log Birth" button is visible

Given I tap "Edit" on the detail screen
Then I am navigated to the Edit form with all fields pre-populated
```

---

### Feature 1.8 — Animal counting (free tier)

"Animals" are **not a separate database entity** in v1.0. An "animal" is a distinct `animalName` value across all non-archived `breedingRecords`. The free-tier limit of 10 animals is enforced by counting unique animal names.

```typescript
// db/queries/breeding.ts
export async function getUniqueAnimalCount(): Promise<number>
// SELECT COUNT(DISTINCT animal_name) FROM breeding_records WHERE archived = false
```

The `canAddAnimal()` tier check in `lib/tierChecks.ts` uses this count. If a user adds a new breeding record for "Daisy" (an animal name that already exists in another record), it does **not** count as a new animal.

**Edge cases:**
- Animal name matching is case-insensitive: "Daisy" and "daisy" are the same animal
- Archived records are excluded from the count — archiving a record may free up an animal slot
- If a user has 10 unique animals and tries to add a record for animal #11, the paywall is shown

---

### MVP task checklist

**Note:** `date-fns` is a required dependency for all date math (see Feature 1.3). It is included with Expo but must be imported explicitly.

```
Phase 1: Scaffold
- [ ] Initialize Expo project: `npx create-expo-app@latest breeding-tracker --template tabs`
- [ ] Configure TypeScript strict mode in tsconfig.json
- [ ] Install and configure NativeWind v4
- [ ] Download and install custom fonts via expo-font:
      Cormorant: 400, 500, 600, 700, Italic 400, Italic 500 (.ttf files in assets/fonts/)
      DM Sans: 300, 400, 500, 600 (.ttf files in assets/fonts/)
      Load fonts in app/_layout.tsx via useFonts hook; keep splash screen visible until fonts load
- [ ] Copy in react-native-reusables components (Button, Card, Sheet, Dialog, Badge, Toast)
- [ ] Set up ESLint with eslint-config-expo, @typescript-eslint, eslint-plugin-prettier
- [ ] Set up Husky + lint-staged pre-commit hook (runs tsc --noEmit and eslint)
- [ ] Set up Drizzle ORM + expo-sqlite
- [ ] Write db/schema.ts (breedingRecords with photo_url column, births tables)
- [ ] Run drizzle-kit generate and drizzle-kit migrate
- [ ] Create constants/species.ts with SPECIES_CONFIG
- [ ] Create constants/strings.ts with all UI copy
- [ ] Create constants/theme.ts with COLORS, STATUS_COLORS, RADIUS, COLOR_TAGS from design system

Phase 2: Core logic
- [ ] Write lib/gestation.ts (calculateDueDate, calculateDaysBred, calculateDaysRemaining, getBreedingStatus)
- [ ] Write unit tests for all gestation functions (target 100% coverage on this file)
- [ ] Write db/queries/breeding.ts (getAll, getById, create, update, delete, archive)
- [ ] Write db/queries/births.ts (getByBreedingId, create)
- [ ] Write Zod schemas in lib/schemas.ts (breedingFormSchema, birthFormSchema)

Phase 3: Screens
- [ ] Build BreedingCard component (all 5 status states, overdue banner, long-press action sheet)
- [ ] Build GestationBadge component
- [ ] Build home screen (app/(tabs)/index.tsx): list, sort, empty state, skeleton loading
- [ ] Build Add/Edit form screen (app/(tabs)/add.tsx): all fields, validation, due date preview
- [ ] Build Breeding Detail screen (app/breeding/[id].tsx): full record view, mark pregnant, birth history
- [ ] Build Log Birth screen (app/birth/[breedingId].tsx): all fields, validation
- [ ] Build Settings screen (app/(tabs)/settings.tsx): all sections per Feature 2.9
- [ ] Wire up Zustand store for list state
- [ ] Implement getUniqueAnimalCount() for free-tier animal counting

Phase 4: Testing + polish
- [ ] Write Jest unit tests for gestation logic (already done in Phase 2)
- [ ] Write component tests for BreedingCard (all 5 status states render correctly)
- [ ] Write Maestro E2E flow: add record → verify due date → mark pregnant → log birth
- [ ] Smoke test on iOS simulator
- [ ] Smoke test on Android emulator
- [ ] Fix any platform-specific layout issues
```

---

## Part 2: v1.0 specification (weeks 5–16)

v1.0 adds authentication, cloud sync, in-app purchases, photos, push notifications, and multi-species. These are production requirements for App Store submission.

---

### Feature 2.1 — Authentication (Supabase Auth)

#### Functional flow

**Onboarding (first launch, no account):**
1. Splash screen (2s) → Welcome screen
2. Welcome screen shows: Freshen logo, tagline `APP_TAGLINE` ("Every new life starts here."), two buttons: "Get Started Free" and "Sign In"
3. "Get Started Free" → Email registration flow
4. "Sign In" → Login flow

**Registration flow:**
1. Email input screen — validated as the user types (after first blur)
2. Password input screen — show/hide toggle, strength indicator (weak/fair/strong)
3. "Create Account" → Supabase `signUp()` call
4. Loading state: button shows spinner, inputs disabled
5. Success → email verification sent → show screen: "Check your email. We sent a link to [email]. Tap it to verify your account." with "Resend Email" button and "Change Email" link
6. Error states (see error messages table)

**Login flow:**
1. Email + password on single screen
2. "Sign In" → Supabase `signInWithPassword()`
3. Loading state: button shows spinner
4. Success → navigate to home screen, run initial PowerSync sync
5. Error states (see error messages table)

**Auth persistence:** Supabase session stored in `expo-secure-store`. On app launch: check for existing session → if valid, skip auth screens. If expired, refresh silently → if refresh fails, show login screen.

**Skip auth (free tier, unauthenticated):**  
Users can use the app without an account. On Welcome screen: "Continue without an account" link below buttons. This locks user to free tier permanently until they sign up. Show periodic (not more than once per week) upgrade prompt: "Back up your data. Create a free account to sync across devices." Dismissible.

#### Error messages — Auth

| Condition | Message |
|---|---|
| Email already registered | "An account with this email already exists. Sign in instead?" (with link) |
| Invalid email format | "Please enter a valid email address." |
| Password < 8 chars | "Password must be at least 8 characters." |
| Password no uppercase | "Password must include at least one uppercase letter." |
| Password no number | "Password must include at least one number." |
| Wrong email/password | "Incorrect email or password. Please try again." |
| Account not verified | "Please verify your email before signing in. Check your inbox." |
| Network error on sign in | "Unable to connect. Check your internet connection and try again." |
| Supabase 500 error | "Something went wrong on our end. Please try again in a moment." |
| Session expired | Silent refresh attempted; if fails: "Your session expired. Please sign in again." |

#### Account deletion

Apple App Store requires account deletion capability. Path: Settings → Account → "Delete Account."

Flow:
1. Confirmation dialog: "Delete your account and all synced data? This cannot be undone. Local data on this device will remain."
2. User enters password to confirm
3. Call Supabase `deleteUser()` (requires service role — implement as Edge Function)
4. Clear local session from expo-secure-store
5. Navigate to Welcome screen
6. Toast: "Account deleted."

#### Acceptance criteria

```gherkin
Given I am a new user on first launch
When I tap "Get Started Free" and enter valid email and password
Then I see "Check your email" screen
And a verification email is sent within 30 seconds

Given I try to sign in with an unverified account
Then I see "Please verify your email before signing in. Check your inbox."
And I am not signed in

Given I tap "Continue without an account"
Then I am taken to the home screen
And I can add up to 10 animals (free tier limit enforced)

Given my session token is expired and I open the app
When the silent refresh fails
Then I see "Your session expired. Please sign in again."
And I am navigated to the login screen
And no data is lost
```

---

### Feature 2.2 — Free/Paid tier enforcement

#### Tier logic

All tier checks go through `lib/tierChecks.ts`. No tier logic in UI components.

```typescript
// lib/tierChecks.ts

export function canAddAnimal(currentCount: number, tier: Tier): boolean
// Returns false if tier === 'free' and currentCount >= 10

export function canEnableNotification(activeNotificationCount: number, tier: Tier): boolean
// Returns false if tier === 'free' and activeNotificationCount >= 1

export function canSyncToCloud(tier: Tier): boolean
// Returns false if tier === 'free'

export function canUploadPhoto(tier: Tier): boolean
// Returns false if tier === 'free'

export function canExportData(tier: Tier): boolean
// Returns false if tier === 'free'

export function canAccessSpecies(species: string, tier: Tier): boolean
// Returns false if tier === 'free' and species !== 'goat'
```

**Features that are free for all tiers (no gate):**
- Breeding record creation (up to 10 animals)
- Birth logging (full create with all fields — not view-only)
- Color tag customization (all 8 colors available)
- Pregnancy confirmation
- Gestation calculation and due date tracking

**Free tier limit enforcement — adding animals:**  
When `canAddAnimal()` returns false and user taps +, do NOT navigate to the Add form. Instead show a bottom sheet: "You've reached the 10-animal limit on the free plan. Upgrade to track unlimited animals." with "Upgrade — $9.99/year" button and "Not now" dismiss.

**Free tier limit enforcement — multi-species:**  
In the species picker, non-goat species show a lock icon and "Premium" badge. Tapping a locked species shows the upgrade prompt.

#### Paywalls

Three paywall moments:
1. **Hard paywall (animal limit):** Shown when free user tries to add animal #11
2. **Soft paywall (feature gate):** Shown when free user taps any locked feature (photo, export, non-goat species)
3. **Contextual upsell (cloud sync):** Shown once per week to unauthenticated or free-tier users

**Paywall screen contents:**
- Headline: "Upgrade to Freshen Pro"
- Feature list (3 bullets): "Unlimited animals," "Cloud backup & sync," "Photos, export & analytics"
- Price display: "$9.99/year — less than $1/month" (primary, highlighted)
- Monthly option: "$1.99/month"
- Lifetime option: "$24.99 one-time"
- 7-day free trial badge on annual plan
- "Start Free Trial" CTA (primary button)
- "Restore Purchases" text link (Apple requirement)
- "No thanks" dismiss (for soft paywalls only; hard paywalls must be dismissed via upgrade or by going back)

**Free trial trigger:** The 7-day free trial is **not** shown on first install. It is only offered when the user encounters a paywall (any of the three moments above). This is a freemium model — users experience the free tier first and hit the trial offer organically when they need a paid feature.

#### Acceptance criteria

```gherkin
Given I am a free-tier user with 10 animals
When I tap + to add an animal
Then I see the upgrade bottom sheet with "You've reached the 10-animal limit"
And I am NOT navigated to the Add form

Given I am a free-tier user
When I tap the species picker and select "Sheep"
Then I see the upgrade prompt for multi-species
And the species does NOT change to Sheep

Given I complete a $9.99/year purchase via RevenueCat
Then my tier immediately updates to 'paid'
And I can add animals beyond the 10-animal limit
And the lock icons disappear from the species picker

Given I tap "Restore Purchases"
When I have a valid prior purchase on my Apple/Google account
Then my paid tier is restored immediately
And I see a toast: "Purchase restored successfully."
```

---

### Feature 2.3 — Cloud sync (PowerSync + Supabase)

Cloud sync is available for paid-tier authenticated users only.

#### Architecture

- All reads and writes happen against local SQLite (same as free tier)
- PowerSync monitors Supabase Postgres WAL and streams changes to local SQLite
- When device comes online after offline period, local writes sync automatically
- Sync status is shown in the UI

#### Supabase schema (mirrors SQLite schema)

```sql
-- Run in Supabase SQL editor

CREATE TABLE breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animal_name TEXT NOT NULL CHECK (char_length(animal_name) BETWEEN 1 AND 50),
  sire_name TEXT CHECK (char_length(sire_name) <= 50),
  pairing_date DATE NOT NULL,
  species TEXT NOT NULL,
  gestation_days INTEGER NOT NULL CHECK (gestation_days BETWEEN 1 AND 400),
  notes TEXT CHECK (char_length(notes) <= 500),
  color TEXT NOT NULL DEFAULT 'gray',
  photo_url TEXT,
  confirmed_pregnant BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  synced_at TIMESTAMPTZ
);

CREATE TABLE births (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breeding_record_id UUID NOT NULL REFERENCES breeding_records(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  does_count INTEGER NOT NULL DEFAULT 0,
  bucks_count INTEGER NOT NULL DEFAULT 0,
  stillborn_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT CHECK (char_length(notes) <= 300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE births ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see/modify their own records
CREATE POLICY "Users access own breeding records"
  ON breeding_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own births"
  ON births FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### PowerSync configuration

```typescript
// lib/sync.ts
import { PowerSyncDatabase } from '@powersync/react-native';
import { AppSchema } from '../db/powersync-schema';

export const powerSyncDB = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'breeding_tracker.db' },
});

// Sync status states the UI must handle:
// 'connected' — actively syncing
// 'connecting' — attempting connection
// 'disconnected' — offline, using local data
// 'syncing' — upload/download in progress
```

**Sync status indicator:** Small icon in home screen header. States:
- Cloud with checkmark (green): connected and synced
- Cloud with arrows (blue, animated): syncing
- Cloud with slash (gray): offline, local data only

Tapping the icon → bottom sheet: "Last synced: [relative time, e.g. '2 minutes ago']" or "Working offline — your data is saved locally and will sync when you reconnect."

#### Conflict resolution

PowerSync uses server-wins for concurrent edits. In practice this is rare (single-user app). No user-facing conflict UI needed for v1.0.

#### Acceptance criteria

```gherkin
Given I am a paid-tier authenticated user online
When I add a breeding record
Then the record appears locally immediately
And the sync indicator shows "syncing"
And within 5 seconds the sync indicator shows "synced"

Given I am offline when I add a breeding record
Then the record is saved to local SQLite
And the sync indicator shows "offline"
When I come back online
Then the record syncs to Supabase within 10 seconds
And the sync indicator shows "synced"

Given I am a free-tier user
When I view the home screen
Then the sync status indicator is NOT shown
And no PowerSync connection is initiated
```

---

### Feature 2.4 — Photo uploads

Photos are a paid-tier feature. Free-tier users see a camera icon with a lock badge.

#### Functional flow

**Taking/selecting a photo:**
1. User taps the camera icon on a breeding record card (available in Edit mode)
2. Action sheet: "Take Photo" or "Choose from Library"
3. Request camera/library permissions via `expo-image-picker`
4. On permission denied: "Camera access is required to take photos. Enable it in Settings." with "Open Settings" button
5. On photo selected: show crop/preview screen with circular crop guide (optional, can skip)
6. Confirm → compress to max 1MB (JPEG, quality 0.8) via `expo-image-manipulator`
7. Upload to Supabase Storage at path: `{userId}/breeding/{breedingRecordId}/{timestamp}.jpg`
8. On upload success: show thumbnail on card and in Edit form
9. On upload failure: "Photo upload failed. Your other changes were saved. Try uploading the photo again." — do not block save of other fields

**Photo storage:**
- Supabase Storage bucket: `animal-photos` (private, RLS-enforced)
- Max file size enforced client-side: 5MB pre-compression, 1MB post-compression
- **One photo per breeding record (confirmed scope for v1.0 and beyond unless explicitly expanded).** The schema supports this with a single `photo_url` column — no migration needed to enforce the limit.
- If a photo already exists on the record, the camera icon shows a small thumbnail. Tapping it opens an action sheet with "Replace Photo" and "Remove Photo" instead of the default "Take Photo / Choose from Library."
- "Remove Photo" → confirmation dialog: "Remove this photo? It cannot be undone." → on confirm, delete from Supabase Storage and clear `photo_url` on the record.
- URL stored in `breeding_records.photo_url` column

**Offline behavior:**  
If user adds a photo while offline, store photo locally and queue for upload when online. PowerSync attachment sync handles this automatically.

#### Error messages

| Condition | Message |
|---|---|
| Permission denied (camera) | "Camera access is required. Enable it in Settings." |
| Permission denied (library) | "Photo library access is required. Enable it in Settings." |
| File too large (>5MB pre-compress) | "This photo is too large. Please choose a photo under 5MB." |
| Upload timeout | "Photo upload is taking too long. Check your connection and try again." |
| Upload error | "Photo upload failed. Your other changes were saved." |

#### Acceptance criteria

```gherkin
Given I am a paid-tier user
When I tap the camera icon on a card and take a photo
Then the photo is compressed to under 1MB
And uploaded to Supabase Storage
And the thumbnail appears on the card within 5 seconds on a normal connection

Given I am offline when I take a photo
Then the photo is stored locally
When I come back online
Then the photo syncs to Supabase automatically

Given I am a free-tier user
When I tap the camera icon
Then I see the upgrade prompt
And no photo is taken
```

---

### Feature 2.5 — Push notifications

Notifications remind users of upcoming due dates. Paid tier: unlimited notifications. Free tier: 1 active notification.

#### Functional flow

**Notification setup:**
1. On first app launch after account creation, request notification permission via `expo-notifications`
2. If denied: show a non-blocking banner: "Enable notifications to get due date reminders." with "Enable" button (which re-triggers the permission request)
3. Permission state stored locally; never ask more than twice without user action

**Notification schedule per breeding record:**
Users set reminder preferences in Settings. Defaults (no emoji — per brand voice guidelines):
- 7 days before due date: "[Animal Name] is due in 7 days."
- 3 days before due date: "[Animal Name] is due in 3 days. Prepare the birthing area."
- 1 day before due date: "[Animal Name] is due tomorrow!"
- On due date: "[Animal Name] is due today. Watch closely."

**Notification management:**
- Notifications are scheduled locally via `expo-notifications` (no server required for v1.0)
- When a breeding record is edited, cancel old notifications and reschedule with new due date
- When birth is logged, cancel all pending notifications for that record
- When record is deleted, cancel all pending notifications for that record
- Paid-tier users can customize notification timing in Settings

#### Free tier notification enforcement

Free tier: only the single closest due date gets a notification. When `canEnableNotification()` returns false, schedule the notification for the most urgent record (closest due date) and skip all others. Show banner on home screen: "Upgrade to get reminders for all your animals."

#### Notification content

| Trigger | Title | Body |
|---|---|---|
| 7 days before | "Due date coming up" | "[Animal Name] is due in 7 days." |
| 3 days before | "Due date coming up" | "[Animal Name] is due in 3 days. Prepare the birthing area." |
| 1 day before | "Due date tomorrow" | "[Animal Name] is due tomorrow!" |
| Due date | "Due today" | "[Animal Name] is due today. Watch closely." |
| 1 day overdue | "Overdue" | "[Animal Name] was due yesterday. No birth logged yet." |

#### Acceptance criteria

```gherkin
Given I add a breeding record with due date 7 days from now
Then 4 local notifications are scheduled (7, 3, 1 day before, and on due date)

Given I log a birth for a record
Then all pending notifications for that record are cancelled immediately

Given I am a free-tier user with 3 records
When notifications are scheduled
Then only the record with the closest due date has an active notification
And the home screen shows a banner: "Upgrade to get reminders for all your animals."
```

---

### Feature 2.6 — RevenueCat integration

#### Setup

```typescript
// lib/purchases.ts
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

export async function initializePurchases(userId: string | null) {
  Purchases.setLogLevel(LOG_LEVEL.WARN); // verbose only in __DEV__
  await Purchases.configure({
    apiKey: Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_RC_API_KEY_IOS
      : process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID,
    appUserID: userId ?? undefined,  // null = anonymous; set after login
  });
}

export async function getOfferings() {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePackage(pkg: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error) {
    if (error.userCancelled) return { success: false, cancelled: true };
    return { success: false, error: error.message };
  }
}

export async function restorePurchases() {
  const customerInfo = await Purchases.restorePurchases();
  return customerInfo;
}

export function isPaidTier(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active['pro'] !== 'undefined';
}
```

**RevenueCat product IDs (configure in RevenueCat dashboard):**
- `freshen_monthly` — $1.99/month
- `freshen_annual` — $9.99/year (with 7-day free trial)
- `freshen_lifetime` — $24.99 one-time

**Entitlement:** `pro`

#### Purchase error handling

| Error | User message |
|---|---|
| `PURCHASE_CANCELLED` | No message — user dismissed intentionally |
| `NETWORK_ERROR` | "Purchase failed — check your connection and try again." |
| `PRODUCT_NOT_AVAILABLE` | "This plan isn't available in your region. Contact support." |
| `ALREADY_PURCHASED` | "You already have an active subscription. Tap 'Restore Purchases' to access it." |
| Generic | "Purchase could not be completed. Please try again or contact support." |

#### Restore purchases flow

1. User taps "Restore Purchases" on paywall
2. Call `Purchases.restorePurchases()`
3. Loading spinner on button
4. On success with active entitlement: "Purchase restored successfully." toast → tier updates to paid
5. On success with no entitlement: "No active purchases found. If you believe this is an error, contact support."
6. On error: "Restore failed. Check your connection and try again."

#### Acceptance criteria

```gherkin
Given I tap "Start Free Trial" on the annual plan paywall
When the purchase succeeds
Then my tier updates to 'paid' immediately (no app restart required)
And I can add animals beyond the free limit
And the paywall does not appear again

Given I purchase on iOS and reinstall the app
When I tap "Restore Purchases" and I have an active subscription
Then the paid tier is restored
And a toast reads "Purchase restored successfully."

Given the App Store purchase fails with NETWORK_ERROR
Then I see "Purchase failed — check your connection and try again."
And no tier change occurs
```

---

### Feature 2.7 — Analytics (PostHog)

PostHog provides product analytics to understand how users interact with Freshen. All tracking calls are routed through `lib/analytics.ts` — no component ever calls PostHog directly.

#### Setup

```typescript
// lib/analytics.ts
import PostHog from 'posthog-react-native';

let client: PostHog | null = null;

export function initializeAnalytics(userId: string | null) {
  client = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
    host: 'https://us.i.posthog.com',
    // Disable in dev to avoid polluting production data
    disabled: __DEV__,
  });
  if (userId) {
    client.identify(userId);
  }
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>) {
  client?.capture(event, properties);
}

export function identifyUser(userId: string) {
  client?.identify(userId);
}

export function resetAnalyticsUser() {
  client?.reset();
}
```

**Env vars:**
```
EXPO_PUBLIC_POSTHOG_API_KEY=[PostHog project API key]
```

#### Events to track

| Event | Trigger | Properties |
|---|---|---|
| `breeding_record_created` | User saves a new breeding record | `species`, `has_sire_name`, `has_notes`, `has_color` |
| `breeding_record_edited` | User saves edits to existing record | `species` |
| `breeding_record_deleted` | User confirms deletion | — |
| `pregnancy_confirmed` | User taps "Mark Pregnant" | `days_bred_at_confirmation` |
| `birth_logged` | User saves a birth record | `total_offspring`, `does_count`, `bucks_count`, `stillborn_count` |
| `sort_order_changed` | User changes list sort | `sort_option` |
| `paywall_viewed` | Paywall bottom sheet shown | `trigger` (animal_limit \| feature_gate \| contextual) |
| `upgrade_tapped` | User taps upgrade CTA on paywall | `plan` (monthly \| annual \| lifetime), `trigger` |
| `purchase_completed` | RevenueCat purchase succeeds | `plan` |
| `purchase_cancelled` | User dismisses purchase flow | `plan` |
| `purchase_restored` | Restore purchases succeeds | — |
| `notification_permission_granted` | User grants notification permission | — |
| `notification_permission_denied` | User denies notification permission | — |
| `export_triggered` | User initiates a data export | `format` (csv \| pdf) |
| `photo_added` | Photo upload succeeds | — |
| `photo_removed` | User removes a photo | — |
| `account_created` | Supabase sign-up succeeds | — |
| `account_deleted` | User confirms account deletion | — |

#### Privacy requirements

PostHog adds the following to App Store privacy labels and Android Data Safety:
- **Analytics data:** App functionality and usage data
- **No personal breeding records are sent to PostHog** — only event names and the enumerated properties above
- No animal names, notes, or photo URLs are ever included in event properties
- PostHog `distinct_id` is the Supabase user UUID for authenticated users, or an anonymous UUID for unauthenticated users

#### Acceptance criteria

```gherkin
Given I am a paid-tier user
When I add a breeding record and save it
Then a `breeding_record_created` event is sent to PostHog
And the event properties include `species` but NOT `animal_name`

Given I am in development mode (__DEV__ = true)
When I perform any action
Then no PostHog events are sent

Given I delete my account
When resetAnalyticsUser() is called
Then PostHog disassociates my user ID from future events
```

---

### Feature 2.8 — Data export (CSV and PDF)

Data export is a paid-tier feature. Free-tier users see the export button with a lock badge.

#### Formats

Both formats are available in v1.0. They are generated on-device from local SQLite data — no server call required.

**CSV export** — machine-readable, suitable for spreadsheets and 4-H record software.

**PDF export** — human-readable, formatted for show records, 4-H/FFA projects, and vet handoffs.

#### Functional flow

**Access:** Settings → "Export My Data" OR top-right menu on the home screen.

**Export screen layout:**
- Title: "Export Records"
- Format picker: "CSV" | "PDF" (segmented control, CSV default)
- Date range filter: "All time" | "This year" | "Last 12 months" | "Custom range" (default: All time)
- Species filter: "All species" | individual species (multi-select, default: all)
- Record status filter: checkboxes for Active, Birth Logged, Archived (default: all checked)
- Preview line: "23 records will be exported."
- "Export" button (primary)
- Share sheet opens on export — user chooses Files, email, AirDrop, etc.

**CSV column schema:**

| Column | Source |
|---|---|
| Animal Name | `breedingRecords.animalName` |
| Sire Name | `breedingRecords.sireName` |
| Species | `breedingRecords.species` label from SPECIES_CONFIG |
| Pairing Date | `breedingRecords.pairingDate` (YYYY-MM-DD) |
| Gestation Days | `breedingRecords.gestationDays` |
| Due Date | calculated via `calculateDueDate()` |
| Confirmed Pregnant | `breedingRecords.confirmedPregnant` (Yes/No) |
| Status | `getBreedingStatus()` label |
| Birth Date | `births.birthDate` (blank if no birth) |
| Does Born | `births.doesCount` |
| Bucks Born | `births.bucksCount` |
| Stillborn | `births.stillbornCount` |
| Notes | `breedingRecords.notes` |
| Created | `breedingRecords.createdAt` |

File name: `freshen-export-YYYY-MM-DD.csv`

**PDF layout:**

- Header: Freshen logo wordmark + "Breeding Records Export" + export date
- Summary block: Total records, date range, species included
- One row per breeding record, grouped by status (Active → Birth Logged → Archived)
- Each record shows: Animal name, sire, species, pairing date, due date, status, birth summary (if applicable), notes
- Footer: "Generated by Freshen · freshenapp.com · [date]"
- Page numbers: "Page N of M"

File name: `freshen-export-YYYY-MM-DD.pdf`

**Implementation notes:**
- CSV: built with a simple string builder, no library needed. Escape commas and quotes in field values.
- PDF: use `react-native-html-to-pdf` — render an HTML template string and convert to PDF. No native PDF library required.
- Both files written to `expo-file-system` cache directory, then shared via `expo-sharing`.

#### Error messages

| Condition | Message |
|---|---|
| No records match filters | "No records match your filters. Adjust the filters and try again." |
| PDF generation fails | "Export failed. Please try again." |
| Share sheet unavailable | "Unable to open share sheet. Please try again." |

#### Acceptance criteria

```gherkin
Given I am a paid-tier user with 5 breeding records
When I tap Export with CSV format selected
Then a CSV file is generated with 5 data rows plus a header row
And the share sheet opens with the file ready to send
And a `export_triggered` PostHog event fires with format: 'csv'

Given I am a paid-tier user
When I tap Export with PDF format selected
Then a PDF is generated with all records visible
And the file is named freshen-export-[today's date].pdf
And the share sheet opens

Given I filter by species "Goat" and there are 0 goat records
When I tap Export
Then I see "No records match your filters."
And no file is generated

Given I am a free-tier user
When I tap "Export My Data"
Then I see the upgrade prompt
And no export is initiated
```

---

### Feature 2.9 — Settings screen

#### Functional flow

**Access:** Settings tab in the bottom tab bar.

**Screen layout — organized by section:**

```
[Header]
  ← Back button (if navigated from non-tab context)
  Screen title: "Settings" (Cormorant H1)

[ACCOUNT section — only shown if authenticated]
  User email row: avatar circle + email address + right chevron → Account detail screen
  "Change Password" with lock icon + right chevron → password change flow
  "Manage Subscription" with cloud icon + tier badge ("Pro ✓" or "Free") + right chevron
    → If paid: shows subscription details, manage via App Store/Play Store link
    → If free: navigates to paywall
  "Delete Account" (destructive, Ember text) → account deletion flow (Feature 2.1)

[ACCOUNT section — unauthenticated users]
  "Create Account" button → registration flow (Feature 2.1)
  "Sign In" text link → login flow

[NOTIFICATIONS section]
  "Due date reminders" toggle (on/off, default: on if permission granted)
    → If toggled on and permission not granted: trigger permission request
  "Reminder timing" row showing current values (e.g., "7, 3, 1 days before")
    → Taps opens picker: checkboxes for 7, 3, 1 day before and due date
    → Paid tier only can customize; free tier shows default with lock badge

[DATA section]
  "Export My Data" with format badges (CSV | PDF)
    → Paid tier: navigates to Export screen (Feature 2.8)
    → Free tier: shows upgrade prompt
  "Export" is the only data option in v1.0. Import is not supported.

[ABOUT section]
  "Privacy Policy" with external-link icon → opens PRIVACY_POLICY_URL in system browser
  "Terms of Service" with external-link icon → opens terms URL in system browser
  "Version" showing app version and build number (e.g., "1.0.0 (42)")
```

#### Acceptance criteria

```gherkin
Given I am an authenticated paid-tier user
When I open Settings
Then I see my email in the Account section
And "Manage Subscription" shows "Pro ✓" badge
And "Export My Data" is tappable without an upgrade prompt

Given I am an unauthenticated user
When I open Settings
Then I see "Create Account" and "Sign In" instead of the email row
And "Delete Account" is NOT shown

Given I toggle "Due date reminders" on
When I have not granted notification permission
Then the system notification permission dialog appears
And if I deny, the toggle reverts to off

Given I tap "Privacy Policy"
Then the system browser opens with the privacy policy URL
```

---

## Part 3: Integration documentation

### Integration: Supabase

**Provider:** Supabase  
**Purpose:** Postgres cloud DB, Auth, Storage  
**Env vars:**
```
EXPO_PUBLIC_SUPABASE_URL=https://[project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service key — EAS secret only, never in client code]
```
**Test mode:** Create a separate Supabase project for staging. Use `EXPO_PUBLIC_SUPABASE_URL_STAGING` in dev builds.

| Action | Method | Notes |
|---|---|---|
| Sign up | `supabase.auth.signUp()` | Returns unconfirmed session until email verified |
| Sign in | `supabase.auth.signInWithPassword()` | |
| Refresh session | `supabase.auth.refreshSession()` | Called silently on app resume |
| Delete account | Supabase Edge Function | Cannot be done from client SDK with anon key |
| Upload photo | `supabase.storage.from('animal-photos').upload()` | Authenticated users only |
| Download photo URL | `supabase.storage.from('animal-photos').createSignedUrl()` | 1-hour expiry |

**Error handling:**

| Supabase error | Cause | App response |
|---|---|---|
| `invalid_credentials` | Wrong email/password | "Incorrect email or password." |
| `email_not_confirmed` | Unverified account | "Please verify your email first." |
| `user_already_exists` | Duplicate registration | "An account with this email already exists." |
| Storage 413 | File too large | "This photo is too large." |
| Any 5xx | Server outage | "Something went wrong. Try again in a moment." |

---

### Integration: PowerSync

**Provider:** PowerSync  
**Purpose:** Offline-first sync from Supabase Postgres to local SQLite  
**Env vars:**
```
EXPO_PUBLIC_POWERSYNC_URL=https://[instance].powersync.journeyapps.com
```
**Only initialized for paid-tier authenticated users.** Free-tier users use Drizzle + expo-sqlite only, no PowerSync connection is opened.

**Sync rules (PowerSync dashboard config):**
```yaml
bucket_definitions:
  user_data:
    parameters: SELECT auth.user_id() AS user_id
    data:
      - SELECT * FROM breeding_records WHERE user_id = bucket.user_id
      - SELECT * FROM births WHERE user_id = bucket.user_id
```

**Attachment sync (photos):**  
PowerSync Attachment API added February 2026. Configure in `lib/sync.ts` using `@powersync/attachments` package.

**Error handling:**

| Error | App response |
|---|---|
| PowerSync connection failed on startup | Fall back to local SQLite silently; show "offline" indicator |
| Sync conflict | Server-wins (default); no user notification |
| PowerSync 5xx | Retry with exponential backoff (1s, 2s, 4s, max 3 retries) then show "offline" indicator |

---

### Integration: RevenueCat

**Provider:** RevenueCat  
**Purpose:** In-app purchase management across iOS and Android  
**Env vars:**
```
EXPO_PUBLIC_RC_API_KEY_IOS=[iOS public key]
EXPO_PUBLIC_RC_API_KEY_ANDROID=[Android public key]
```
**Free tier:** $0 until $2,500 Monthly Tracked Revenue  
**Webhook:** Configure RevenueCat webhook to Supabase Edge Function to update `users.tier` column on purchase events. This is the canonical tier source for server-side logic.

---

### Integration: Expo Notifications

**Provider:** Expo Push Service (free)  
**Purpose:** Local scheduled notifications for due date reminders  
**v1.0 scope:** Local notifications only (no server push). Remote push via EPS in v2.0.

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';

export async function requestPermissions(): Promise<boolean>
export async function scheduleBreedingNotifications(record: BreedingRecord): Promise<void>
export async function cancelBreedingNotifications(breedingRecordId: string): Promise<void>
export async function cancelAllNotifications(): Promise<void>
```

All notification identifiers use pattern: `breeding-{breedingRecordId}-{daysBefore}` so they can be cancelled by record ID.

---

### Integration: PostHog

**Provider:** PostHog  
**Purpose:** Product analytics — event tracking, funnel analysis, feature flags  
**Env vars:**
```
EXPO_PUBLIC_POSTHOG_API_KEY=[PostHog project API key]
```
**SDK:** `posthog-react-native`  
**Disabled in:** `__DEV__` mode (all events silently dropped)  
**PII policy:** No animal names, notes, photo URLs, or email addresses are ever sent as event properties. User identity is the Supabase UUID only.

| Action | Method |
|---|---|
| Initialize (on app launch) | `initializeAnalytics(userId)` in `lib/analytics.ts` |
| Identify after login | `identifyUser(userId)` |
| Track event | `track('event_name', { ...properties })` |
| Reset on logout/account delete | `resetAnalyticsUser()` |

**Error handling:** PostHog SDK fails silently — a network error or bad API key must never crash the app or disrupt user flows. Wrap `initializeAnalytics` in try/catch; if it throws, log to console in dev and continue.

---

## Part 4: Security implementation

All items required before App Store submission.

### Credential storage

- Auth session tokens → `expo-secure-store` (iOS Keychain / Android AES-256 Keystore)
- Never use `AsyncStorage` for any sensitive value
- RevenueCat and Supabase API keys → `expo-secure-store` on first run or injected via EAS Build Secrets

```typescript
// lib/secureStorage.ts
import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async set(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};
```

### Input validation

All user input validated via Zod before write to SQLite or Supabase. Schema in `lib/schemas.ts`:

```typescript
export const breedingFormSchema = z.object({
  animalName: z.string().min(1, 'Animal name is required.').max(50, 'Animal name must be 50 characters or less.').trim(),
  sireName: z.string().max(50).trim().optional(),
  pairingDate: z.string().refine(val => {
    const d = parseISO(val);
    const today = startOfDay(new Date());
    const oneYearAgo = subDays(today, 365);
    return d <= today && d >= oneYearAgo;
  }, { message: 'Pairing date must be between today and one year ago.' }),
  species: z.enum(Object.keys(SPECIES_CONFIG) as [string, ...string[]]),
  gestationDays: z.number().int().min(1, 'Gestation days must be between 1 and 400.').max(400, 'Gestation days must be between 1 and 400.'),
  notes: z.string().max(500, 'Notes must be 500 characters or less.').optional(),
  color: z.enum(['gray', 'ember', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple']),
});
```

### Network security

- `android:usesCleartextTraffic="false"` in app.json android config
- All API calls over HTTPS
- Certificate pinning not required for v1.0 (Supabase uses Let's Encrypt)

### Photo security

- Supabase Storage bucket set to private
- Photos accessed via time-limited signed URLs (1-hour expiry)
- Local photo cache uses `expo-file-system` in the app's documents directory (not accessible to other apps)

---

## Part 5: App Store submission requirements

### iOS — Apple App Store

**Developer Program:** $99/year (one-time enrollment before TestFlight)

**Required before submission:**
- [ ] Privacy policy URL hosted at `https://[yourdomain]/privacy`
- [ ] Privacy labels configured in App Store Connect:
  - Photos/Camera: "Take photos of animals for identification"
  - User content (breeding records): "Stored and used to provide app functionality"
  - Push notifications: "Due date reminders"
  - Email address: "Account creation and communication"
  - Analytics/Usage data: "App usage events to improve the product (PostHog); no personal breeding data included"
- [ ] "Restore Purchases" button visible on all paywalls
- [ ] Account deletion available in Settings → Account → Delete Account
- [ ] All IAP uses Apple StoreKit (no external payment links in the app)
- [ ] App does not crash on launch on oldest supported iOS version (iOS 16)

**Build and submit:**
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android — Google Play Store

**Developer fee:** $25 one-time

**Required before submission:**
- [ ] Privacy policy URL (same as iOS)
- [ ] Data Safety Form completed in Play Console:
  - Personal info collected: email address
  - App activity: in-app purchases, app interactions, feature usage analytics (PostHog)
  - All data encrypted in transit: yes
  - User can request data deletion: yes
- [ ] Target SDK 35 (Android 15) per 2025 requirements
- [ ] 64-bit APK (Hermes bytecode satisfies this)

**Build and submit:**
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## Part 6: Testing specification

### Unit tests (Jest + jest-expo)

**Coverage targets:** 90%+ on `lib/gestation.ts` and `lib/tierChecks.ts`. 80%+ overall.

**Required test suites:**

```
tests/
  unit/
    gestation.test.ts          # All exported functions, including edge cases
    tierChecks.test.ts          # All canX() functions, both tiers
    schemas.test.ts             # Zod schema validation, valid and invalid inputs
  components/
    BreedingCard.test.tsx       # Renders all 5 status states; overdue banner shows/hides
    GestationBadge.test.tsx     # Correct color and text per status
    BreedingForm.test.tsx       # Validation errors appear on submit with bad data
```

**Run:** `npx jest --coverage`

### E2E tests (Maestro)

```yaml
# flows/add-breeding-entry.yaml
appId: com.freshenapp.freshen
---
- launchApp
- assertVisible: "No breeding records yet"
- tapOn: "+"
- inputText:
    id: "animal-name-input"
    text: "Daisy"
- tapOn: "Save"
- assertVisible: "Breeding record saved"
- assertVisible: "Daisy"

# flows/log-birth.yaml
appId: com.freshenapp.freshen
---
- launchApp
- longPressOn:
    text: "Daisy"
- tapOn: "Log Birth"
- tapOn: "+"   # does count increment
- tapOn: "Save Birth Record"
- assertVisible: "Birth logged for Daisy"
- assertVisible: "Birth Logged"   # status badge
```

**Required flows:**
- [ ] `add-breeding-entry.yaml` — happy path add
- [ ] `add-breeding-validation.yaml` — submit empty form, verify errors appear
- [ ] `mark-pregnant.yaml` — long press → mark pregnant → badge changes
- [ ] `log-birth.yaml` — log birth → status changes
- [ ] `sort-records.yaml` — change sort order → verify order changes

**Run:** `npx maestro test flows/`

### Definition of Done (per feature)

A feature is not "Done" until:
1. ✓ All acceptance criteria verified (happy path AND all error paths)
2. ✓ All 4 UI states implemented: empty, loading, success, error
3. ✓ Exact error messages from spec are shown (not generic fallback text)
4. ✓ No `TODO` or `console.log` in production code paths
5. ✓ Unit tests passing at or above coverage target
6. ✓ TypeScript type check passes (`npx tsc --noEmit`)
7. ✓ ESLint passes with no errors
8. ✓ Tested on both iOS simulator and Android emulator

---

## Part 7: v1.0 task checklist

```
Auth (Feature 2.1)
- [ ] Install and configure Supabase JS v2
- [ ] Create lib/supabase.ts with Supabase client (reads from expo-secure-store for session)
- [ ] Create lib/secureStorage.ts wrapper
- [ ] Create app/welcome.tsx (Welcome screen with Get Started / Sign In / Continue without account)
- [ ] Create app/register.tsx (email + password + verification pending screen)
- [ ] Create app/login.tsx (email + password)
- [ ] Implement auth guard in app/_layout.tsx (redirect to welcome if no session)
- [ ] Implement session refresh on app resume (AppState listener)
- [ ] Create Settings → Account → Delete Account flow with Edge Function
- [ ] Write unit tests for auth error message mapping

Tier enforcement (Feature 2.2)
- [ ] Create lib/tierChecks.ts with all canX() functions
- [ ] Create useTierStore.ts Zustand store (reads entitlement from RevenueCat on launch)
- [ ] Add tier check to Add form (intercept before navigation)
- [ ] Add lock badges to species picker for non-goat species
- [ ] Create PaywallBottomSheet component (used for all 3 paywall moments)
- [ ] Write unit tests for all tierChecks functions

RevenueCat (Feature 2.6)
- [ ] Install react-native-purchases
- [ ] Create lib/purchases.ts with all helper functions
- [ ] Wire initializePurchases() to app startup (after auth init)
- [ ] Integrate PaywallBottomSheet with RevenueCat offerings
- [ ] Implement Restore Purchases flow
- [ ] Test IAP in StoreKit sandbox (iOS) and Google Play test track (Android)
- [ ] Configure RevenueCat webhook → Supabase Edge Function for server-side tier sync

Cloud sync (Feature 2.3)
- [ ] Run Supabase schema SQL (breeding_records, births tables with RLS)
- [ ] Install @powersync/react-native and @powersync/attachments
- [ ] Create lib/sync.ts with PowerSync initialization (only for paid+authenticated)
- [ ] Create db/powersync-schema.ts mirroring SQLite schema
- [ ] Configure sync rules in PowerSync dashboard
- [ ] Add SyncStatusIndicator component to home screen header
- [ ] Test offline → edit → online → verify sync
- [ ] Write Maestro test for offline sync flow

Photos (Feature 2.4)
- [ ] Create Supabase Storage bucket 'animal-photos' with RLS
- [ ] Install expo-image-picker and expo-image-manipulator
- [ ] Create PhotoCapture component (camera icon + action sheet)
- [ ] Implement compression to max 1MB
- [ ] Implement upload to Supabase Storage with signed URL retrieval
- [ ] Queue failed uploads for retry via PowerSync attachment sync
- [ ] Add photo_url column to breeding_records schema + migration

Notifications (Feature 2.5)
- [ ] Install expo-notifications
- [ ] Create lib/notifications.ts with all helper functions
- [ ] Request permission on first launch post-signup (inside registration success flow, before navigating to home)
- [ ] Schedule 4 notifications per breeding record on create/edit
- [ ] Cancel notifications on birth log and record deletion
- [ ] Implement free-tier enforcement (single notification cap)
- [ ] Add notification preferences to Settings screen

Analytics (Feature 2.7)
- [ ] Install posthog-react-native
- [ ] Create lib/analytics.ts with initializeAnalytics, track, identifyUser, resetAnalyticsUser
- [ ] Wire initializeAnalytics() to app startup (after auth init, pass userId or null)
- [ ] Wire identifyUser() to post-login success
- [ ] Wire resetAnalyticsUser() to logout and account deletion
- [ ] Add track() calls for all events in the Feature 2.7 event table
- [ ] Verify __DEV__ guard: confirm no events fire in dev/simulator builds
- [ ] Write unit tests for analytics wrapper (mock PostHog, assert correct events fire)

Data export (Feature 2.8)
- [ ] Install react-native-html-to-pdf and expo-sharing
- [ ] Create Export screen (app/export.tsx) with format picker, filters, preview count
- [ ] Write CSV generator in lib/export.ts (exportToCSV function)
- [ ] Write PDF HTML template in lib/export.ts (exportToPDF function using react-native-html-to-pdf)
- [ ] Add export button to Settings screen with paid-tier gate
- [ ] Write unit tests for CSV output (verify column headers, row count, field escaping)
- [ ] Write unit test for PDF: verify it generates a file without throwing
- [ ] Add `canExportData()` check — show upgrade prompt for free-tier users

Settings (Feature 2.9)
- [ ] Build Settings screen (app/(tabs)/settings.tsx) with all sections
- [ ] Wire Account section: show email/auth state, manage subscription, delete account
- [ ] Wire Notifications section: toggle, reminder timing picker, permission request
- [ ] Wire Data section: export with tier gate
- [ ] Wire About section: privacy policy, terms, version display

App Store prep
- [ ] Create privacy policy page at freshenapp.com/privacy covering all data collected
- [ ] Create app icons and splash screen (1024x1024 and all required sizes via EAS)
- [ ] Create App Store screenshots (6.9", 6.5", 5.5" iPhone; 12.9" iPad)
- [ ] Write App Store description (lead with "breeding-only focus" differentiator)
- [ ] Configure EAS Build profiles (development, preview, production)
- [ ] Submit to TestFlight (100 internal testers)
- [ ] Submit to Google Play internal test track
- [ ] Address any App Review feedback
- [ ] Submit for App Store production review
```

---

## Part 8: Non-functional requirements

| Requirement | Target | Measurement |
|---|---|---|
| App cold launch time | < 2 seconds to interactive on iPhone 12 | Measured in Xcode Instruments |
| List render (100 records) | < 100ms | Jest performance test |
| SQLite write (single record) | < 50ms | Jest performance test |
| Supabase auth response | < 2 seconds on 4G | Manual test |
| PowerSync initial sync | < 5 seconds for first 100 records on WiFi | Manual test |
| Photo upload (1MB) | < 10 seconds on 4G | Manual test |
| Offline availability | 100% of read/write features | All core flows work in airplane mode |
| App bundle size | < 50MB download | EAS build output |

---

## Resolved decisions

All questions from the initial draft have been answered. This section records the decisions for future reference.

| Question | Decision |
|---|---|
| **Data export format** | Both CSV and PDF in v1.0. CSV for spreadsheet/4-H software; PDF formatted for show records and vet handoffs. Specified fully in Feature 2.8. |
| **Photo limit** | One photo per breeding record, confirmed scope for v1.0 and beyond unless explicitly changed. Schema uses a single `photo_url` column so expanding later requires only a migration, not an architectural change. Replace and Remove Photo flows included. |
| **App name** | **Freshen** — `com.freshenapp.freshen` / `freshenapp.com`. Name is isolated in `constants/app.ts`; renaming requires editing only that file and `app.json`. Full naming research and trademark clearance rationale documented separately. |
| **Notification permission timing** | Request on first launch after account creation — inside the registration success flow, immediately before navigating to the home screen. Not deferred to first record creation. |
| **Analytics** | PostHog in v1.0. All calls routed through `lib/analytics.ts`. No personal breeding data (animal names, notes, photos) sent as properties. Privacy labels updated accordingly. Specified fully in Feature 2.7. |
| **Due date storage** | `dueDate` is always derived from `pairingDate + gestationDays` via `calculateDueDate()`. No stored column. Sort in-memory after computing. See Feature 1.3. |
| **Animal counting** | Animals are distinct `animalName` values across non-archived breeding records. No separate `animals` table. Case-insensitive matching. See Feature 1.8. |
| **Birth logging tier** | Birth logging is free for all tiers. Not gated behind paid tier. |
| **Color customization tier** | Color tag picker is free for all tiers. All 8 colors available to free users. |
| **Free trial trigger** | 7-day trial offered only when user encounters a paywall, not on first install. Freemium model. |
| **Dark mode** | Not supported in v1.0. Light mode only. |

---

## Changelog
- 2026-03-18 v1.2: Gap analysis resolution — added Breeding Detail screen spec (Feature 1.7), animal counting logic (Feature 1.8), Settings screen spec (Feature 2.9), documented dueDate as derived (not stored) with sort pattern, added photo_url to both SQLite and Supabase schemas, fixed color enum ('ember' not 'red') to match design system, clarified birth logging and color customization as free-tier features, removed emoji from notification copy per brand voice, added font loading to scaffold checklist, fixed acceptance criteria typo (Feature 1.2), removed erroneous gestation test value, clarified MVP species picker behavior, documented free trial trigger mechanism, added dark mode exclusion note, added date-fns dependency note, added constants/theme.ts to scaffold
- 2026-03-18 v1.1: Added app name (Freshen), name-change isolation policy, constants/app.ts spec, PostHog analytics (Feature 2.7), data export CSV+PDF (Feature 2.8), PostHog integration doc, confirmed photo limit (1 per breeding record with Replace/Remove flows), confirmed notification permission timing (post-signup), resolved all open questions, updated privacy labels for analytics, updated task checklists
- 2026-03-18 v1.0: Initial PRD — full MVP + v1.0 spec
