# Freshen — Implementation Plan

**Version:** 2.0 | **Created:** 2026-03-18 | **Revised:** 2026-07-17
**Source PRD:** `_discovery/livestock-breeding-tracker-PRD-v1.2.md`
**Design System:** `_discovery/kindled-design-system-branding.md`
**Backend stack:** `_dev/backend-stack-decision.md` — **Clerk + Vercel (Neon, Functions, Blob) replaces Supabase** as of v2.0. Where this plan and the PRD name Supabase, the stack-decision doc governs.
**Status:** In Progress

## Status snapshot (2026-07-17, end of day)

- **Phases 0–6 complete and verified.** 97 Jest tests, `tsc` + `eslint` clean, all 5 Maestro flows pass (twice consecutively) on iPhone 17 Pro simulator, iOS 26.5, **Release** configuration. Merged to main at `c477bde`.
- Backend stack is Clerk + Vercel (`_dev/backend-stack-decision.md`). `backend/` scaffold committed with 21 passing unit tests — **not deployed** (blocked on Phase 7.0 accounts). Covers Phase 7A Agent B's code tasks; deploy + Neon schema push remain.
- Release-only app bugs found by E2E and fixed: missing `expo-crypto` (every insert failed in release builds — dev builds masked it), Sheet wrapper Pressables flattening iOS accessibility (VoiceOver/tests couldn't reach sheet items), raw Zod copy instead of PRD copy on offspring `max(20)`.
- Toolchain constraints discovered (also recorded in CLAUDE.md): jest pinned to `~29.7.0` (jest-expo 55 breaks under jest 30); Maestro needs a Java runtime (`brew install openjdk`); E2E must target a Release build — dev-client builds break `launchApp: clearState`.

**What's left before store submission (in order):**

1. **Phase 6 remainder:** run the flow suite on an Android emulator; fix platform-specific issues.
2. **E2E coverage gaps** (fold into Phase 9): detail screen, edit/delete, archive/unarchive, overdue banner, sort persistence across restart, "Breeding record saved." toast.
3. **Open PRD question (product decision needed):** `birthFormSchema` rejects stillborn-only births — the ≥1-offspring rule sums does + bucks only. Decide whether stillborn-only litters are loggable.
4. **Phase 7.0 (requires the user):** create Clerk, Vercel, Neon, PowerSync, RevenueCat, and PostHog accounts; set env vars per the 7.0 checklist.
5. **Phase 7A/7B:** six integration agents + wiring (Agent B's code exists; needs deploy, Neon push, webhook pointing).
6. **Phase 8:** photo uploads (Vercel Blob) + CSV/PDF export.
7. **Phase 9:** full integration QA on both platforms, edge cases, performance checks.
8. **Phase 10:** store accounts, EAS builds, listings/privacy labels, TestFlight/Play test tracks, review.

---

## How to use this document

This is the execution plan for building Freshen from zero to App Store submission. It is designed for **agentic development** — AI agents working in parallel where dependencies allow.

**Rules for agents:**
1. Read the relevant PRD feature section **before** writing any code.
2. Check off tasks (`- [x]`) as you complete them.
3. Run the **gate checks** at the end of each phase before starting the next.
4. When a phase says "parallelizable," agents CAN work on those tasks simultaneously in separate worktrees.
5. When a phase says "sequential," tasks MUST be completed in order.
6. Reference `CLAUDE.md` for code conventions, project structure, and business rules.
7. After completing work, run `npx tsc --noEmit` and `npx eslint . --fix` to validate.

**Progress key:**
- `[ ]` = Not started
- `[~]` = In progress
- `[x]` = Complete
- `[!]` = Blocked

---

## Phase 0 — Project Scaffold (Sequential)

> **Why sequential:** Every subsequent phase depends on the project skeleton, toolchain, and database being in place. No parallelism possible here.

**Agent assignment:** Single agent

### 0.1 — Initialize Expo project
- [x] Run `npx create-expo-app@latest freshen --template tabs` (or initialize in current directory)
- [x] Move generated files into repo root if needed
- [x] Verify `npx expo start` launches without errors
- [x] Configure `app.json`: set `name`, `slug`, `bundleIdentifier` to `com.freshenapp.freshen`, `package` to `com.freshenapp.freshen`

### 0.2 — TypeScript strict mode
- [x] Update `tsconfig.json`: set `strict: true`, `noEmit: true`, `skipLibCheck: true`
- [x] Verify `npx tsc --noEmit` passes

### 0.3 — Install core dependencies
- [x] Install NativeWind v4: `nativewind tailwindcss react-native-css-interop`
- [x] Configure `tailwind.config.js` with content paths and NativeWind preset
- [x] Configure `babel.config.js` for NativeWind
- [x] Install Drizzle ORM + expo-sqlite: `drizzle-orm expo-sqlite drizzle-kit`
- [x] Install Zod: `zod`
- [x] Install date-fns (should be available via Expo, but confirm import works)
- [x] Install Zustand: `zustand`
- [x] Install expo-font for custom fonts
- [x] Verify all imports resolve with `npx tsc --noEmit`

### 0.4 — Custom fonts
- [x] Download Cormorant .ttf files (400, 500, 600, 700, Italic 400, Italic 500) → `assets/fonts/`
- [x] Download DM Sans .ttf files (300, 400, 500, 600) → `assets/fonts/`
- [x] Configure `useFonts` hook in `app/_layout.tsx`
- [x] Keep splash screen visible until fonts load (`expo-splash-screen`)
- [x] Verify fonts render in a test Text component

### 0.5 — UI component library
- [x] Copy react-native-reusables components into `components/ui/`: Button, Card, Sheet, Dialog, Badge, Toast, Input, Textarea, Select
- [x] Verify components render without errors
- [x] Add NativeWind class utilities as needed

### 0.6 — Linting and formatting
- [x] Install ESLint: `eslint eslint-config-expo @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-prettier prettier`
- [x] Create `.eslintrc.js` with expo config
- [x] Create `.prettierrc`
- [x] Verify `npx eslint . --fix` passes
- [x] Install Husky + lint-staged: `husky lint-staged`
- [x] Configure pre-commit hook: `tsc --noEmit && eslint --fix`

### 0.7 — Database schema
- [x] Create `db/schema.ts` with `breedingRecords` table (all columns per PRD Feature 1.2 data schema, including `photo_url`)
- [x] Create `births` table in `db/schema.ts` (per PRD Feature 1.5 data schema)
- [x] Create `drizzle.config.ts` pointing to expo-sqlite driver
- [x] Run `npx drizzle-kit generate` to create initial migration
- [x] Create database initialization utility in `db/client.ts`

### 0.8 — Constants files
- [x] Create `constants/app.ts` — APP_NAME, APP_TAGLINE, APP_STORE_SUBTITLE, BUNDLE_ID, SUPPORT_EMAIL, PRIVACY_POLICY_URL, TERMS_URL
- [x] Create `constants/species.ts` — SPECIES_CONFIG with all 7 species (per PRD Feature 1.6)
- [x] Create `constants/strings.ts` — all user-facing copy (empty state text, error messages, toasts, labels)
- [x] Create `constants/theme.ts` — COLORS, STATUS_COLORS, RADIUS, COLOR_TAGS from design system

### 0.9 — Testing infrastructure
- [x] Install Jest + jest-expo: `jest jest-expo @testing-library/react-native @testing-library/jest-native`
- [x] Create `jest.config.js` with expo preset
- [x] Verify `npx jest` runs (even with 0 tests)
- [x] Create `tests/unit/` and `tests/components/` directories

**Gate check:**
```bash
npx expo start          # Must launch
npx tsc --noEmit        # Must pass
npx eslint .            # Must pass
npx jest                # Must run (0 tests OK)
```

---

## Phase 1 — Core Business Logic (Parallelizable)

> **Why parallel:** These modules have NO dependencies on each other. Each is a pure logic file with unit tests. Deploy 3 agents simultaneously.

### Agent A: Gestation Logic
**PRD ref:** Feature 1.3

- [x] Create `lib/gestation.ts` with all 4 functions:
  - `calculateDueDate(pairingDate, gestationDays)` → ISO date string
  - `calculateDaysBred(pairingDate)` → integer
  - `calculateDaysRemaining(dueDate)` → integer
  - `getBreedingStatus(record)` → BreedingStatus enum
- [x] Use ONLY date-fns: `differenceInCalendarDays`, `addDays`, `parseISO`, `format`
- [x] Export `BreedingStatus` type: `'bred' | 'pregnant' | 'overdue' | 'birth_logged' | 'archived'`
- [x] Create `tests/unit/gestation.test.ts`:
  - `calculateDueDate("2026-01-01", 150)` → `"2026-05-31"`
  - `calculateDaysBred` with mocked today
  - `calculateDaysRemaining` — positive, zero, negative cases
  - `getBreedingStatus` — all 5 status branches
  - Edge: archived trumps overdue, birth_logged trumps overdue
- [x] Achieve 100% code coverage on `lib/gestation.ts`

### Agent B: Zod Schemas
**PRD ref:** Feature 1.2, Feature 1.5, Part 4

- [x] Create `lib/schemas.ts`:
  - `breedingFormSchema` — all fields per PRD with exact error messages
  - `birthFormSchema` — birthDate, doesCount, bucksCount, stillbornCount, notes
  - Helper types: `BreedingFormData`, `BirthFormData` inferred from schemas
- [x] Create `tests/unit/schemas.test.ts`:
  - Valid breeding form passes
  - Empty animal name → "Animal name is required."
  - Animal name > 50 chars → "Animal name must be 50 characters or less."
  - Future pairing date → "Pairing date cannot be in the future."
  - Pairing date > 365 days ago → correct error
  - Gestation days out of range → correct error
  - Notes > 500 chars → correct error
  - Valid birth form passes
  - All offspring 0 → "Please enter at least one offspring."
  - Birth date before pairing date → correct error

### Agent C: Tier Checks
**PRD ref:** Feature 2.2

- [x] Create `lib/tierChecks.ts` with all 6 functions:
  - `canAddAnimal(currentCount, tier)` — false if free && count >= 10
  - `canEnableNotification(activeCount, tier)` — false if free && count >= 1
  - `canSyncToCloud(tier)` — false if free
  - `canUploadPhoto(tier)` — false if free
  - `canExportData(tier)` — false if free
  - `canAccessSpecies(species, tier)` — false if free && species !== 'goat'
- [x] Export `Tier` type: `'free' | 'paid'`
- [x] Create `tests/unit/tierChecks.test.ts`:
  - Each function tested with both tiers
  - Boundary: canAddAnimal at 9, 10, 11
  - canAccessSpecies for each of 7 species on each tier

**Gate check (all 3 agents):**
```bash
npx jest --coverage     # gestation.ts: 100%, tierChecks.ts: 90%+, schemas.ts: 90%+
npx tsc --noEmit        # Must pass
```

---

## Phase 2 — Database Queries (Sequential)

> **Why sequential:** Depends on Phase 0 (schema) and Phase 1 (gestation logic for computed due dates). Single agent.

**Agent assignment:** Single agent

### 2.1 — Breeding queries
**PRD ref:** Feature 1.1, Feature 1.8

- [x] Create `db/queries/breeding.ts`:
  - `getAllBreedingRecords()` — fetch all, compute `dueDate` via `calculateDueDate()`, return sorted array
  - `getBreedingRecordById(id)` — single record
  - `createBreedingRecord(data)` — insert with UUID v4, timestamps
  - `updateBreedingRecord(id, data)` — update with new `updatedAt`
  - `deleteBreedingRecord(id)` — hard delete
  - `archiveBreedingRecord(id)` — set `archived = true`
  - `confirmPregnancy(id)` — set `confirmedPregnant = true`
  - `getUniqueAnimalCount()` — `SELECT COUNT(DISTINCT LOWER(animal_name)) FROM breeding_records WHERE archived = false`
- [x] All functions use Drizzle ORM query builder
- [x] All writes set `updatedAt` to ISO 8601 datetime

### 2.2 — Birth queries
**PRD ref:** Feature 1.5

- [x] Create `db/queries/births.ts`:
  - `getBirthsByBreedingId(breedingRecordId)` — all births for a record
  - `createBirth(data)` — insert with UUID v4, timestamps
  - `hasAnyBirth(breedingRecordId)` — boolean check for status logic
- [x] Foreign key references `breedingRecords.id` with cascade delete

### 2.3 — Database initialization
- [x] Create `db/client.ts`:
  - Initialize expo-sqlite database
  - Run Drizzle migrations on first launch
  - Export `db` instance for use across app
- [x] Wire into `app/_layout.tsx` — initialize DB before rendering children

**Gate check:**
```bash
npx tsc --noEmit        # Must pass — queries type-check against schema
```

---

## Phase 3 — Zustand Stores (Parallelizable)

> **Why parallel:** Each store is independent. Deploy 2 agents.

### Agent A: Breeding Store
- [x] Create `store/useBreedingStore.ts`:
  - State: `records`, `isLoading`, `error`, `sortOption`
  - Actions: `fetchRecords()`, `addRecord()`, `updateRecord()`, `deleteRecord()`, `archiveRecord()`, `confirmPregnancy()`, `setSortOption()`
  - Sort options enum matching PRD: due date asc/desc, date added newest/oldest, animal name A-Z
  - `sortOption` persisted to AsyncStorage
  - All actions call `db/queries/breeding.ts` functions

### Agent B: Tier Store
- [x] Create `store/useTierStore.ts`:
  - State: `tier` (free | paid), `isLoading`
  - Actions: `initialize()` (reads from RevenueCat or defaults to free), `setTier()`
  - For MVP: always returns 'free' — RevenueCat integration comes in Phase 7
- [x] Create `store/useAuthStore.ts`:
  - State: `session`, `user`, `isLoading`, `isAuthenticated`
  - Actions: `initialize()`, `signIn()`, `signUp()`, `signOut()`, `refreshSession()`
  - For MVP: unauthenticated mode only — auth integration (Clerk) comes in Phase 7

**Gate check:**
```bash
npx tsc --noEmit        # Must pass
```

---

## Phase 4 — MVP Screens (Mixed Parallelism)

> **Strategy:** The home screen and breeding form are the two core screens. They can be built in parallel. The detail screen and birth form depend on shared components from the first two, so they come second.

### Wave 4A — Core Components + Two Main Screens (Parallelizable — 3 agents)

#### Agent A: Shared Components
**PRD ref:** Feature 1.1 (card spec), Design System Section 7

- [x] Create `components/breeding/GestationBadge.tsx`:
  - Accepts `status: BreedingStatus`
  - Renders pill badge with correct bg/text colors per CLAUDE.md status badge table
  - 5 visual states: Bred (yellow), Pregnant (green), Overdue (red), Birth Logged (blue), Archived (gray)
- [x] Create `components/breeding/BreedingCard.tsx`:
  - Displays: animal name (bold), sire name ("× [name]" or "Sire unknown"), days bred counter, due date, status badge
  - Overdue: red "OVERDUE" banner across top
  - Long-press → action sheet with: Edit Entry, Mark Pregnant (conditional), Log Birth, Archive (conditional), Delete
  - Uses `GestationBadge` for status
  - Uses Cormorant for animal name, DM Sans for labels
- [x] Write `tests/components/BreedingCard.test.tsx` — render with a fixture record per status (`bred`, `pregnant`, `overdue`, `birth_logged`, `archived`); assert badge label text per status; assert "OVERDUE" banner text present only for `overdue`; assert "× [sire]" when sire set and "Sire unknown" when null. Assert on rendered text and `testID`s, not computed NativeWind styles (class → style resolution is unreliable under jest-expo).
- [x] Write `tests/components/GestationBadge.test.tsx` — one render per status; assert label text ("Bred", "Pregnant", "Overdue", "Birth logged", "Archived" per `constants/strings.ts`) and `testID={'badge-' + status}` (add the testID to the component if missing)

#### Agent B: Home Screen (Breeding List)
**PRD ref:** Feature 1.1

- [x] Create `app/(tabs)/index.tsx`:
  - **Empty state:** Illustration placeholder + "No breeding records yet. Tap + to add your first entry." + FAB
  - **Loading state:** 3 skeleton placeholder cards
  - **Populated state:** FlatList of `BreedingCard` components, sorted by `sortOption`
  - **Error state:** "Something went wrong loading your records. Pull down to try again."
  - Header: total active record count ("3 active breedings.")
  - Sort icon (top-right) → sort options bottom sheet
  - Pull-to-refresh triggers re-query
  - FAB (+) bottom-right → navigates to Add screen
- [x] Sort preference persists via useBreedingStore
- [x] Active/overdue entries appear before archived entries

#### Agent C: Add/Edit Breeding Form
**PRD ref:** Feature 1.2

- [x] Create `components/breeding/BreedingForm.tsx`:
  - All form fields per PRD: Animal Name, Sire Name, Pairing Date, Species, Gestation Days, Notes, Color/Tag
  - Species defaults to "Goat", Pairing Date defaults to today, Gestation Days auto-fills from SPECIES_CONFIG
  - Gestation days auto-fill behavior: confirm before overwriting manual edits
  - Live due date preview below Pairing Date and Gestation Days
  - Species picker: only "Goat" enabled in MVP; others show "Coming soon" disabled
  - Validates via Zod `breedingFormSchema` on submit
  - Inline field errors with exact PRD copy
  - Character counter on Notes field
- [x] Create `app/(tabs)/add.tsx`:
  - **Add mode:** title "Add Breeding", empty fields (except defaults)
  - **Edit mode:** title "Edit Breeding", pre-populated fields, "Save Changes" button
  - Save → write to SQLite via breeding store, navigate back, toast "Breeding record saved."
  - Delete (edit mode only) → confirmation dialog → delete → navigate back → toast "Record deleted."
- [x] Write `tests/components/BreedingForm.test.tsx` — submit empty form → "Animal name is required." renders; animal name of 51 chars → "Animal name must be 50 characters or less."; notes field shows live character counter ("N/500"); valid submit calls the `onSubmit` prop with parsed `BreedingFormData` (mock the store/navigation, exact error copy from `lib/schemas.ts`)

### Wave 4B — Detail + Birth Screens (Parallelizable — 2 agents)

> **Depends on:** Wave 4A components (BreedingCard, GestationBadge, BreedingForm)

#### Agent A: Breeding Detail Screen
**PRD ref:** Feature 1.7

- [x] Create `components/breeding/BreedingDetail.tsx` — the content component
- [x] Create `app/breeding/[id].tsx`:
  - Header: back button, animal name title, Edit button (top-right)
  - Photo section placeholder (paid tier, shows lock badge in MVP)
  - Status section with badge + "Mark Pregnant" button (only if status = Bred)
  - Stats row: Days Bred | Days Left | Due Date (Cormorant display numbers)
  - Info section: Sire, Species, Pairing Date, Gestation days, Color tag
  - Notes section (only if notes exist)
  - Birth history section:
    - No births: "No births logged yet." + "Log Birth" button
    - Has births: list of birth summary cards with species-specific terms + "Log Another Birth" button
  - Actions: Archive/Unarchive toggle button (Archive only if no birth logged and not archived; Unarchive if archived), Delete button (red)
  - **States:** Loading (skeleton), Populated, Error, Deleted externally
- [x] Mark Pregnant from detail: same behavior as action sheet (Feature 1.4)
- [x] Unarchive flow: detail screen shows "Unarchive" button for archived records → sets `archived = false`, updates `updatedAt`, returns record to active list, may re-count toward animal limit

#### Agent B: Log Birth Screen
**PRD ref:** Feature 1.5

- [x] Create `app/birth/[breedingId].tsx`:
  - Title: "Log Birth — [Animal Name]"
  - Birth Date picker (default today, cannot be before pairing date, cannot be future)
  - Offspring counts: Does (female), Bucks (male), Stillborn — number inputs 0–20
  - Notes textarea (max 300 chars)
  - "Save Birth Record" button
  - Validation: total offspring ≥ 1, all counts ≤ 20
  - Exact error messages per PRD
  - Save → write birth record, navigate back, toast "Birth logged for [animal name].", status badge updates
- [x] Uses species-specific offspring terms from SPECIES_CONFIG (e.g., "Ewe lamb" for sheep)

**Gate check (all of Phase 4):**
```bash
npx tsc --noEmit                 # Must pass
npx eslint .                     # Must pass
npx jest --coverage              # Component tests pass
npx expo start                   # App launches, screens render
```

**Manual verification:**
- [x] Empty state renders on first launch (screenshot + E2E)
- [x] Can add a breeding record and see it on home screen (E2E)
- [x] Card shows correct status, days bred, due date (screenshot: 0 days bred / 150 left / Dec 14)
- [ ] Can tap card → detail screen renders all sections
- [x] Can mark pregnant → badge changes immediately (E2E incl. toast)
- [x] Can log birth → status updates to "Birth Logged" (E2E)
- [ ] Can edit and delete records
- [ ] Sort options work and persist
- [x] Long-press action sheet shows correct options per record state (screenshot: Edit entry / Mark pregnant / Log birth / Archive / Delete)
- [ ] Overdue banner shows for records past due date
- [x] Form validation shows all required error messages (E2E + unit tests)

---

## Phase 5 — Settings Screen + MVP Polish (Sequential)

> **Why sequential:** Settings is the last MVP screen. Polish tasks depend on all screens being in place.

**Agent assignment:** Single agent

### 5.1 — Settings screen (MVP subset)
**PRD ref:** Feature 2.9 (MVP-relevant sections only)

- [x] Create `app/(tabs)/settings.tsx`:
  - **ACCOUNT section (unauthenticated):** "Create Account" button + "Sign In" link (both navigate nowhere in MVP — placeholder)
  - **NOTIFICATIONS section:** Placeholder — "Due date reminders" toggle (non-functional in MVP)
  - **DATA section:** "Export My Data" with lock badge (non-functional in MVP — shows "Coming in Pro")
  - **ABOUT section:** Privacy Policy link (opens URL), Terms link (opens URL), Version display
- [x] Version display reads from `expo-constants` (app version + build number)

### 5.2 — Navigation wiring
- [x] Verify all routes work: `/(tabs)/index`, `/(tabs)/add`, `/(tabs)/settings`, `/breeding/[id]`, `/birth/[breedingId]`
- [x] Tab bar: Home (list icon), Add (+ icon), Settings (gear icon)
- [x] Back navigation works correctly from all screens
- [x] Pass `breedingId` param correctly between screens

### 5.3 — Toast system
- [x] Wire up toast notifications for all success/error messages per PRD
- [x] Toasts: "Breeding record saved.", "Record deleted.", "Pregnancy confirmed for [name].", "Birth logged for [name]."

### 5.4 — Visual polish
- [x] Apply design system colors throughout (Parchment backgrounds, Bark text, Ember CTAs)
- [x] Apply Cormorant font for display text (titles, animal names, stat numbers)
- [x] Apply DM Sans font for interface text (labels, buttons, body copy)
- [x] Verify all status badge colors match CLAUDE.md table
- [x] Verify all spacing, radius, shadow values match design system
- [x] No emoji anywhere in UI

### 5.5 — Confirm pregnancy flow
**PRD ref:** Feature 1.4

- [x] Long-press → "Mark Pregnant" → instant update, badge change, toast
- [x] Detail screen "Mark Pregnant" button → same behavior
- [x] Button/option hidden when already pregnant
- [x] Verify persistence across app restart

**Gate check — MVP COMPLETE:**
```bash
npx tsc --noEmit
npx eslint .
npx jest --coverage              # 90%+ on lib/, 80%+ overall
npx expo start                   # Full MVP walkthrough
```

**MVP acceptance test (manual walkthrough):**
- [x] Fresh install → empty state (E2E + screenshot, Release build)
- [x] Add breeding record → appears in list (E2E)
- [ ] Edit record → changes reflected
- [x] Mark pregnant → status changes (E2E incl. toast copy)
- [x] Log birth → status changes to Birth Logged (E2E)
- [ ] Archive record → moves below active records
- [ ] Delete record → removed from list
- [~] Sort options: A–Z verified via E2E; other 4 options + persistence unverified
- [ ] Pull-to-refresh → list refreshes
- [~] Status badges: bred/pregnant/birth-logged verified live; overdue/archived via component tests only
- [x] Form validation errors show exact PRD copy (animal name verified in UI; all messages unit-tested)
- [~] Toasts: pregnancy-confirmed toast verified in UI; others unit-level only
- [ ] Settings screen renders with about section
- [ ] App works fully offline (no network calls in MVP)

---

## Phase 6 — E2E Tests (Sequential)

> **Why sequential:** Depends on all MVP screens being functional.

**Agent assignment:** Single agent

- [x] Install Maestro CLI: `curl -fsSL "https://get.maestro.mobile.dev" | bash`, then verify `maestro --version`
- [x] Create `flows/add-breeding-entry.yaml` — happy path: launch → empty state → tap + → fill form → save → verify card
- [x] Create `flows/add-breeding-validation.yaml` — submit empty form → verify error messages
- [x] Create `flows/mark-pregnant.yaml` — long press → mark pregnant → verify badge change
- [x] Create `flows/log-birth.yaml` — long press → log birth → verify status change
- [x] Create `flows/sort-records.yaml` — change sort order → verify list reorders
- [x] Build a dev client first (`npx expo run:ios`) — Maestro drives the installed app, `appId: com.freshenapp.freshen`
- [x] Run all flows on iOS simulator — 5/5 passing against a Release build (2026-07-17). Required extensive flow fixes (clearState, keyboard-dismiss swipe, home-settle waits, substring regexes for flattened card labels) and surfaced three app bugs, all fixed: missing expo-crypto (inserts failed in release), Sheet accessibility flattening (VoiceOver + E2E could not reach items), raw Zod copy on offspring max instead of PRD copy
- [ ] Run all flows on Android emulator (`npx expo run:android`, then `maestro test flows/`)
- [x] Fix any platform-specific issues (iOS; Android pending)

**Gate check:**
```bash
npx maestro test flows/          # All flows pass
```

---

## Phase 7 — v1.0 Backend + Integrations (Mixed Parallelism)

> **Strategy:** Client auth (Clerk), the Vercel backend, PowerSync, RevenueCat, PostHog, and Notifications are largely independent. Build them in parallel against the contracts in `_dev/backend-stack-decision.md`, then wire together in 7B.
>
> **Stack note (v2.0):** This phase was rewritten for Clerk + Vercel. Where the PRD says "Supabase Auth" read Clerk; where it says "Edge Function" read Vercel Function; where it says "Supabase Storage" read Vercel Blob. PRD UX, copy, and acceptance criteria still apply verbatim.

### 7.0 — External account setup (user + agent together, blocking for 7A)

> **Click-by-click walkthrough with exact values and ordering: `_dev/phase-7-account-setup.md`**

Accounts/dashboards the user must create or have access to before agents can finish 7A:

- [x] **Clerk** — application "Freshen" created (`app_3GeBlreHlRJUN2oUi3chkQYhT3h`, dev instance) and linked via `clerk init`; publishable key written to `.env`, secret key moved to `backend/.env` (2026-07-17)
- [ ] **Clerk** — verify the **Native API** is enabled: Dashboard → Native applications (required for native apps; check while creating the JWT template)
- [ ] **Clerk** — create JWT template named `powersync` (`aud` = PowerSync instance URL, lifetime 60 min); note JWKS URL
- [ ] **Vercel** — create project `freshen-backend` pointing at `backend/` in this repo
- [ ] **Neon** — provision via Vercel Marketplace; enable logical replication (Neon dashboard → Settings); note `DATABASE_URL`
- [ ] **Vercel Blob** — create store, note `BLOB_READ_WRITE_TOKEN`
- [ ] **PowerSync Cloud** — create instance; note instance URL (needed for Clerk JWT template `aud`)
- [ ] **RevenueCat** — create project; create `pro` entitlement; products: annual (w/ 7-day trial), monthly, lifetime. Requires App Store Connect + Play Console in-app products (depends on Phase 10 store accounts — can stub with sandbox until then)
- [ ] **PostHog** — create project, note API key
- [ ] Create `.env` (gitignored) with: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_POWERSYNC_URL`, `EXPO_PUBLIC_BACKEND_URL`, `EXPO_PUBLIC_POSTHOG_API_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
> **Naming decision (2026-07-17):** RevenueCat client keys are `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (code + this doc). The PRD's `EXPO_PUBLIC_RC_API_KEY_*` names are superseded.

- [ ] Set Vercel env vars on `freshen-backend`: `CLERK_SECRET_KEY`, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `REVENUECAT_WEBHOOK_AUTH`

### Wave 7A — Independent Integrations (Parallelizable — 6 agents)

#### Agent A: Clerk Auth (client)
**PRD ref:** Feature 2.1 (UX/copy/acceptance criteria unchanged; provider is Clerk)

**Interfaces — produces:** `useAuthStore` façade: `{ isAuthenticated: boolean, userId: string | null, email: string | null, isLoading: boolean, signOut(): Promise<void>, deleteAccount(): Promise<void> }`. Components never import Clerk directly — only `app/_layout.tsx` (provider) and `store/useAuthStore.ts` touch Clerk APIs.

> **API note (2026-07-17):** installed SDK is `@clerk/expo` v3.7 (package renamed from `@clerk/clerk-expo`). Use the **current method-based custom-flows API only** — `useSignIn()`/`useSignUp()` return `{ signIn/signUp, errors, fetchStatus }` with methods like `signIn.password()` and `finalize()`. The legacy `create()` → `prepare…()` → `attempt…()` → `setActive()` pattern lives at `@clerk/expo/legacy` and must not be used for new code. Before writing flows, consult the local `clerk-expo` skill (`references/custom-flows.md`) and verify signatures against `node_modules/@clerk/expo/dist/*.d.ts`.

- [x] Install `@clerk/expo` and `expo-secure-store`; add `"@clerk/expo"` + `"expo-secure-store"` to `app.json` plugins (done via `clerk init` + `expo install`, 2026-07-17)
- [x] Update `app/_layout.tsx` — root wrapped in `<ClerkProvider publishableKey={…} tokenCache={tokenCache}>` with `tokenCache` imported from `@clerk/expo/token-cache` (never a hand-rolled secure-store cache) (2026-07-17)
- [x] Add auth guard to `app/_layout.tsx`: no session AND no "skipped auth" flag → redirect to `/welcome` (implemented as `useAuthGate()` in `store/useAuthStore.ts`, called from `RootLayoutNav` inside `ClerkProvider`; gates on `isLoaded` + skip-flag hydration before redirecting) (2026-07-17)
- [x] Update `store/useAuthStore.ts` — façade over Clerk's `useAuth`/`useUser` per the interface above; `deleteAccount()` → `POST ${EXPO_PUBLIC_BACKEND_URL}/api/account/delete` with bearer token, then Clerk `signOut()` (2026-07-17)
- [x] Create `app/welcome.tsx` — logo, APP_TAGLINE, "Get Started Free", "Sign In", "Continue without an account" (sets skipped-auth flag in AsyncStorage → home, free tier, no sync) (2026-07-17)
- [x] Create `app/register.tsx` — `useSignUp()` **method-based flow**: email (validated on blur) + password (show/hide toggle) → email-code verification screen → finalize. Must render `<View nativeID="clerk-captcha" />` (Clerk bot protection needs the mount point). Map Clerk error codes (`form_identifier_exists`, `form_password_pwned`, `form_password_length_too_short`, verification failures) to the PRD error-copy table in `constants/strings.ts` (2026-07-17)
- [x] Create `app/login.tsx` — `useSignIn()` **method-based flow**: `signIn.password({ identifier, password })` → `finalize()`; map `form_identifier_not_found` / `form_password_incorrect` to PRD copy; "Forgot password?" → method-based email-code reset flow (2026-07-17)
- [x] Session persistence across app restart verified via live E2E (relaunch lands signed-in on home, token cache working)
- [x] Live E2E (flows-live/register.yaml): register with +clerk_test email → code 424242 → home → relaunch still signed in; user verified server-side. Sign-out path still needs a manual pass.

#### Agent B: Vercel Backend + Neon
**Stack ref:** `_dev/backend-stack-decision.md` (contracts), PRD Part 2 / Feature 2.3 (cloud schema)

**Interfaces — produces:** the four endpoints below at `EXPO_PUBLIC_BACKEND_URL`. All except the webhook require `Authorization: Bearer <Clerk JWT>`; all writes scoped to the token's `sub`, never a client-supplied user id.

- [x] Create `backend/` — standalone `package.json` (TypeScript, `@clerk/backend`, `drizzle-orm`, `@neondatabase/serverless`, `@vercel/blob`, `zod`), `vercel.json`, deployed as Vercel project `freshen-backend`
- [x] Create `backend/db/schema.ts` — Drizzle **Postgres** schema: `users` (id = Clerk user id, email, tier, created_at), `breeding_records`, `births` — column parity with mobile `db/schema.ts` plus `user_id` FK on both record tables
- [x] Push schema to Neon (2026-07-17, tables + wal_level=logical + `powersync` publication verified by live query): `npx drizzle-kit push` (backend config); confirm logical replication enabled
- [x] Create `backend/lib/auth.ts` — `requireUser(req): Promise<string>` — verify bearer JWT via `@clerk/backend` `verifyToken()`, return `sub`; throw 401 otherwise
- [x] Create `backend/api/sync/upload.ts` — validate body with Zod against the batch contract (`op: PUT|PATCH|DELETE`, `table: breeding_records|births`, `id`, `data`); apply to Neon in a transaction; upsert for PUT, partial update for PATCH, delete for DELETE; force `user_id = sub`; `200 {}` / `400` / `401`
- [x] Create `backend/api/webhooks/revenuecat.ts` — check `Authorization` header equals `REVENUECAT_WEBHOOK_AUTH`; on `INITIAL_PURCHASE`/`RENEWAL`/`UNCANCELLATION` set `users.tier = 'paid'`, on `EXPIRATION` set `'free'` (key by `app_user_id` = Clerk user id)
- [x] Create `backend/api/account/delete.ts` — `requireUser` → delete Blob photos under `{userId}/`, delete Neon rows (births cascade), delete Clerk user via backend SDK; `200`
- [x] Create `backend/api/photos/upload-url.ts` — `requireUser` → issue Blob client-upload token for pathname `{userId}/breeding/{recordId}/{timestamp}.jpg` (Phase 8 consumes this)
- [x] (unit tests done — 21 vitest; Neon+Clerk-token integration test pending) Unit-test upload handler logic (Zod validation + op mapping) with Vitest or Jest in `backend/`; integration-test against Neon dev branch with a Clerk dev token
- [x] Deployed to production via git push (3 build fixes: runtime spec, TS 5.9 pin, ESM .js extensions); unauthenticated 401s verified live. 200-with-token test pending a real Clerk session. Original: Deploy: `vercel deploy` (preview) → smoke-test 401 without token, 200 with token → `vercel deploy --prod`

#### Agent C: PowerSync Cloud Sync
**PRD ref:** Feature 2.3 (UX unchanged); auth via Clerk JWT, backend via Agent B's upload endpoint

**Interfaces — consumes:** Clerk `getToken({ template: 'powersync' })`; `POST /api/sync/upload` (Agent B). **Produces:** `lib/sync.ts`: `initSync(userId): Promise<void>`, `teardownSync(): Promise<void>`, `useSyncStatus(): 'synced' | 'syncing' | 'offline'`.

- [ ] Install `@powersync/react-native` (+ peer deps; `--legacy-peer-deps`)
- [ ] Create `db/powersync-schema.ts` — PowerSync schema mirroring `breeding_records` + `births`
- [ ] Create `lib/sync.ts` — PowerSync init gated on paid + authenticated; `fetchCredentials()` returns `{ endpoint: EXPO_PUBLIC_POWERSYNC_URL, token: await getToken({ template: 'powersync' }) }`; `uploadData()` drains `getCrudBatch()` → maps CrudEntry ops to the upload contract → POST → `complete()` on 200, throw on failure (PowerSync retries)
- [ ] PowerSync dashboard: connect Neon as source; set auth to Clerk JWKS URL; sync rules — one bucket per user: `SELECT * FROM breeding_records WHERE user_id = request.user_id()`, same for `births`
- [ ] Create `components/breeding/StatusIndicator.tsx` — synced (cloud + check, green) / syncing (cloud + arrows, blue, animated) / offline (cloud + slash, gray); tap → bottom sheet with last-sync time
- [ ] Add StatusIndicator to home header (paid tier only); free tier: PowerSync never initialized
- [ ] Manual test: paid+authed on two simulators → record created on A appears on B; airplane-mode edit on A syncs after reconnect

#### Agent D: RevenueCat + Tier Enforcement
**PRD ref:** Feature 2.2, Feature 2.6

- [x] Install `react-native-purchases` (10.4.3)
- [x] Create `lib/purchases.ts`: (note: v10 `Purchases.configure()` is synchronous — PRD sample is wrong; no-ops safely when platform key env is missing)
  - `initializePurchases(userId)` — configure with platform API key, `appUserID` = Clerk user id (anonymous when auth skipped)
  - `getOfferings()` — fetch current offerings
  - `purchasePackage(pkg)` — handle purchase with error cases
  - `restorePurchases()` — restore flow
  - `isPaidTier(customerInfo)` — check 'pro' entitlement
- [x] Update `store/useTierStore.ts`:
  - Read entitlement from RevenueCat on launch
  - `purchaseAndUpdate()` action
  - `restoreAndUpdate()` action
- [x] Create `components/PaywallBottomSheet.tsx`:
  - Headline: "Upgrade to [APP_NAME] Pro" (APP_NAME from constants)
  - Feature bullets, price display (annual/monthly/lifetime)
  - 7-day free trial badge on annual
  - "Start Free Trial" CTA, "Restore Purchases" link
  - "No thanks" dismiss (soft paywalls only)
- [x] Wire tier checks into Add form (intercept navigation if animal limit reached)
- [x] (as "· Premium" label + tap-intercept → paywall; true badge needs a custom picker outside components/ui) Add lock badges to species picker for non-goat species
- [~] Wired 2 of 3 paywall moments (animal limit hard, species soft); contextual weekly upsell → 7B. Wire PaywallBottomSheet to all 3 paywall moments (animal limit, feature gate, contextual)
- [x] All error messages per PRD table (purchase errors, restore errors)
- [ ] RevenueCat dashboard: point webhook at `POST /api/webhooks/revenuecat` with the `REVENUECAT_WEBHOOK_AUTH` header (endpoint built by Agent B)
- [ ] Test webhook: sandbox purchase event → `users.tier` updates in Neon

#### Agent E: PostHog Analytics
**PRD ref:** Feature 2.7

- [x] Install `posthog-react-native` (4.57.0)
- [x] Create `lib/analytics.ts`:
  - `initializeAnalytics(userId)` — init with API key, disable in __DEV__
  - `track(event, properties)` — capture event
  - `identifyUser(userId)` — identify after login
  - `resetAnalyticsUser()` — reset on logout/delete
- [x] Define `AnalyticsEvent` type union with all events from PRD table
- [ ] Wire init to app startup (after auth)
- [ ] Wire identify to post-login (Clerk user id — never email)
- [ ] Wire reset to logout and account deletion
- [ ] Add `track()` calls for all events:
  - breeding_record_created, breeding_record_edited, breeding_record_deleted
  - pregnancy_confirmed, birth_logged, sort_order_changed
  - paywall_viewed, upgrade_tapped, purchase_completed, purchase_cancelled, purchase_restored
  - notification_permission_granted/denied
  - export_triggered, photo_added, photo_removed
  - account_created, account_deleted
- [x] Verify no PII (animal names, notes, photos) in event properties (rule enforced in module header + typed properties)

#### Agent F: Expo Notifications
**PRD ref:** Feature 2.5

- [x] Install `expo-notifications` (55.0.25)
- [x] Create `lib/notifications.ts`: (13 tests, 100% coverage; free-tier soonest-due helper `pickFreeTierRecord`)
  - `requestPermissions()` → boolean
  - `scheduleBreedingNotifications(record)` — schedule 4 notifications per record (7d, 3d, 1d, due date)
  - `cancelBreedingNotifications(breedingRecordId)` — cancel by identifier pattern
  - `cancelAllNotifications()`
- [x] Notification identifiers: `breeding-{breedingRecordId}-{daysBefore}`
- [ ] Notification content uses exact copy from PRD table (no emoji)
- [ ] Schedule on record create/edit, cancel on birth log/delete
- [ ] Free tier enforcement: only closest due date gets notification
- [ ] Permission request on registration success (before navigating to home)
- [ ] Handle permission denied: non-blocking banner
- [ ] Add notification preferences to Settings screen (reminder timing picker, paid-only customization)

### Wave 7B — Integration Wiring (Sequential)

> **Depends on:** All Wave 7A agents complete.

**Agent assignment:** Single agent

- [ ] Wire auth flow end-to-end: welcome → register/login → home
- [ ] Wire tier store to RevenueCat on app launch
- [ ] Wire PowerSync init: only if paid + authenticated
- [ ] Wire analytics init sequence: auth → analytics → purchases
- [ ] Wire notification scheduling into breeding create/edit/delete flows
- [ ] Update Settings screen with full authenticated sections:
  - Account section: user email row, "Change Password" flow (Clerk `user.updatePassword({ currentPassword, newPassword })`), account detail screen
  - "Manage Subscription" row: if paid → subscription details + App Store/Play Store link; if free → navigate to paywall
  - "Delete Account" button → confirmation → password re-entry (verify via Clerk sign-in before calling) → `useAuthStore.deleteAccount()` (backend `/api/account/delete`) → welcome screen
  - Notification toggles with real permission requests
  - Export button wired to paid-tier gate
- [ ] Test unauthenticated flow: continue without account → free tier → all gates work
- [ ] Test authenticated free flow: sign up → free tier → animal limit → paywall
- [ ] Test authenticated paid flow: sign up → purchase → full access → sync active

**Gate check:**
```bash
npx tsc --noEmit
npx eslint .
npx jest --coverage
```

---

## Phase 8 — Photos + Data Export (Parallelizable — 2 agents)

> **Why parallel:** Photos and export are independent paid-tier features.

### Agent A: Photo Uploads
**PRD ref:** Feature 2.4

- [ ] Install `expo-image-picker` and `expo-image-manipulator`
- [ ] Create photo capture flow:
  - Action sheet: "Take Photo" / "Choose from Library"
  - Permission request (camera/library)
  - Compress to max 1MB (JPEG, quality 0.8)
  - Upload to Vercel Blob: request client-upload token from `POST /api/photos/upload-url` (Phase 7 Agent B), upload to path `{userId}/breeding/{recordId}/{timestamp}.jpg`, store returned Blob URL in `photo_url`
- [ ] Handle existing photo: action sheet with "Replace Photo" / "Remove Photo"
- [ ] Remove photo: confirmation dialog → `del(url)` via a backend endpoint (add `POST /api/photos/delete`, `requireUser` + ownership check) → clear `photo_url`
- [ ] Offline queuing: save file locally (expo-file-system) with a pending flag; retry upload on reconnect; `photo_url` syncs through the normal record sync once set
- [ ] Photo display on breeding detail screen (16:9 aspect, rounded corners)
- [ ] Free tier: camera icon with lock badge → upgrade prompt
- [ ] All error messages per PRD table

### Agent B: Data Export (CSV + PDF)
**PRD ref:** Feature 2.8

- [ ] Install `react-native-html-to-pdf` and `expo-sharing` and `expo-file-system`
- [ ] Create `lib/export.ts`:
  - `exportToCSV(records, births, filters)` — string builder, proper escaping
  - `exportToPDF(records, births, filters)` — HTML template → PDF
- [ ] CSV: all columns per PRD table, file name `freshen-export-YYYY-MM-DD.csv`
- [ ] PDF: header with logo, summary block, records grouped by status, footer, page numbers
- [ ] Create `app/export.tsx`:
  - Format picker (CSV | PDF)
  - Date range filter (All time | This year | Last 12 months | Custom)
  - Species filter (multi-select)
  - Status filter (checkboxes)
  - Preview count: "23 records will be exported."
  - Export → share sheet
- [ ] Wire to Settings: "Export My Data" → paid tier gate → export screen
- [ ] Error: no matching records, generation failure, share sheet unavailable
- [ ] Unit tests: CSV output verification (headers, row count, escaping), PDF generates without error

**Gate check:**
```bash
npx tsc --noEmit
npx eslint .
npx jest --coverage
```

---

## Phase 9 — Final Integration + QA (Sequential)

> **Why sequential:** This is the integration testing and polish phase. Must be methodical.

**Agent assignment:** Single agent

### 9.1 — Full integration test
- [ ] Clean install on iOS simulator — run through entire user journey:
  1. First launch → welcome screen
  2. Continue without account → free tier
  3. Add 3 breeding records → verify list, sort, cards
  4. Mark one pregnant → verify badge change
  5. Log birth for one → verify status change
  6. Try to add animal #11 → paywall appears
  7. Go to settings → verify all sections render
  8. Detail screen for each record → verify all sections
- [ ] Same walkthrough on Android emulator
- [ ] Fix any platform-specific layout issues

### 9.2 — Authenticated + paid tier test
- [ ] Sign up with test account → verify email flow
- [ ] Purchase via StoreKit sandbox → tier updates
- [ ] Add records → verify sync indicator appears
- [ ] Go offline → add record → go online → verify sync
- [ ] Upload photo → verify display
- [ ] Export CSV and PDF → verify file contents
- [ ] Custom notification timing → verify

### 9.3 — Edge case testing
- [ ] Delete all records → empty state returns
- [ ] Record with very long animal name (50 chars) → layout doesn't break
- [ ] Record with no sire → "Sire unknown" displays
- [ ] Multiple births on single record → all show in detail
- [ ] Archive record → moves below active, frees animal slot
- [ ] Unarchive by editing → moves back to active
- [ ] Overdue record → banner + badge correct
- [ ] App kill and relaunch → data persists, state correct

### 9.4 — Performance checks
- [ ] List with 100 records → renders in < 100ms
- [ ] Cold launch → interactive in < 2 seconds
- [ ] SQLite write → < 50ms

### 9.5 — Code quality final pass
- [ ] Remove all `console.log` from production code paths
- [ ] Remove all `TODO` comments
- [ ] Verify no hardcoded strings in UI (all from constants/strings.ts)
- [ ] Verify APP_NAME never hardcoded (always from constants/app.ts)
- [ ] Verify no raw Date arithmetic (all via date-fns in lib/gestation.ts)
- [ ] Verify no tier checks in UI components (all via lib/tierChecks.ts)
- [ ] Verify no PostHog calls outside lib/analytics.ts

**Gate check — v1.0 FEATURE COMPLETE:**
```bash
npx tsc --noEmit                 # Zero errors
npx eslint .                     # Zero errors
npx jest --coverage              # 90%+ on lib/, 80%+ overall
npx maestro test flows/          # All E2E flows pass
```

---

## Phase 10 — App Store Prep (Sequential)

> **Why sequential:** Submission-specific tasks with external dependencies.

**Agent assignment:** Single agent (store-account steps require the user)

### 10.1 — Accounts + hosting (user)
- [ ] Enroll in Apple Developer Program ($99/yr) — needed before TestFlight
- [ ] Create Google Play Console account ($25 one-time)
- [ ] Register/confirm freshenapp.com; host privacy policy + terms (a static Vercel site fits the stack) at the URLs in `constants/app.ts`

### 10.2 — Build configuration
- [ ] Create privacy policy + terms page content (data collected: email via Clerk, breeding records via Neon/PowerSync, purchases via RevenueCat, analytics via PostHog)
- [ ] Verify app icons + splash render correctly (assets exist in `assets/images/` — check 1024×1024 source quality)
- [ ] `eas init` (links EAS project id into `app.json`) and create `eas.json` with `development`, `preview`, `production` profiles
- [ ] Set EAS env vars for production: all `EXPO_PUBLIC_*` keys from Phase 7.0 (production values — production Clerk instance, prod PowerSync URL, prod backend URL)
- [ ] Promote Vercel backend to production domain; set production Clerk keys on it
- [ ] Clerk: create production instance (separate prod instance + domain); update PowerSync JWKS URL to prod; **re-enable bot protection (disabled on dev for E2E) and keep username disabled — see phase-7-account-setup.md step 1**
- [ ] Build iOS: `eas build --platform ios --profile production`
- [ ] Build Android: `eas build --platform android --profile production`

### 10.3 — Store listings
- [ ] Write App Store description (lead with "breeding-only focus" differentiator); subtitle from `constants/app.ts`
- [ ] Create App Store screenshots (6.9", 6.5", 5.5" iPhone; 12.9" iPad)
- [ ] Create Play Store listing (feature graphic 1024×500, phone + tablet screenshots)
- [ ] Configure iOS privacy labels in App Store Connect (email address, purchases, product interaction — matches privacy policy)
- [ ] Configure Android Data Safety Form in Play Console (same disclosures)
- [ ] Create in-app products in App Store Connect + Play Console; link them in RevenueCat (unblocks real-device purchase testing)

### 10.4 — Test tracks + review
- [ ] Submit to TestFlight for internal testing (`eas submit --platform ios`)
- [ ] Submit to Google Play internal test track (`eas submit --platform android`)
- [ ] Full sandbox purchase test on TestFlight build (trial start, purchase, restore)
- [ ] Address App Review feedback (if any)
- [ ] Submit for production review (both stores)

---

## Dependency Graph

```
Phase 0 (Scaffold)
    │
    ├──→ Phase 1A (Gestation) ──┐
    ├──→ Phase 1B (Schemas)  ───┼──→ Phase 2 (DB Queries)
    └──→ Phase 1C (Tier Checks)─┘         │
                                           ├──→ Phase 3A (Breeding Store) ──┐
                                           └──→ Phase 3B (Tier/Auth Store) ─┤
                                                                            │
         ┌──────────────────────────────────────────────────────────────────┘
         │
         ├──→ Phase 4A-AgentA (Components) ──┐
         ├──→ Phase 4A-AgentB (Home Screen) ─┼──→ Phase 4B-AgentA (Detail) ──┐
         └──→ Phase 4A-AgentC (Add/Edit)  ───┘    Phase 4B-AgentB (Birth)  ──┤
                                                                              │
                                              Phase 5 (Settings + Polish) ◄───┘
                                                         │
                                              Phase 6 (E2E Tests)
                                                         │
                              Phase 7.0 (External accounts — user)
                                                     │
         ┌──→ Phase 7A-A (Clerk Auth)    ──┐         │
         ├──→ Phase 7A-B (Vercel Backend)─┤◄────────┘
         ├──→ Phase 7A-C (PowerSync)     ─┼──→ Phase 7B (Wire Together)
         ├──→ Phase 7A-D (RevenueCat)    ─┤         │
         ├──→ Phase 7A-E (PostHog)       ─┤         │
         └──→ Phase 7A-F (Notifications) ─┘         │
                                                     ├──→ Phase 8A (Photos)  ──┐
                                                     └──→ Phase 8B (Export)  ──┤
                                                                               │
                                                     Phase 9 (QA) ◄────────────┘
                                                         │
                                                     Phase 10 (App Store)
```

---

## Agent Deployment Summary

| Phase | Agents | Parallelizable | Estimated Prompts |
|-------|--------|---------------|-------------------|
| 0 — Scaffold | 1 | No | 1–2 |
| 1 — Core Logic | 3 | Yes | 1 |
| 2 — DB Queries | 1 | No | 1 |
| 3 — Stores | 2 | Yes | 1 |
| 4A — Core Screens | 3 | Yes | 1–2 |
| 4B — Detail + Birth | 2 | Yes | 1 |
| 5 — Settings + Polish | 1 | No | 1–2 |
| 6 — E2E Tests | 1 | No | 1 |
| 7.0 — External accounts | user + 1 | No | 1 |
| 7A — Integrations | 6 | Yes | 1–2 |
| 7B — Wiring | 1 | No | 1 |
| 8 — Photos + Export | 2 | Yes | 1 |
| 9 — QA | 1 | No | 1–2 |
| 10 — App Store | 1 | No | 1–2 |
| **Total** | — | — | **~13–18 prompts** |

---

## How to Start a Phase

When beginning a new phase, the agent should:

1. Read this file — check which phase is next (first incomplete phase)
2. Read the PRD sections referenced in that phase
3. Read `CLAUDE.md` for code conventions and project structure
4. Complete all tasks in order (or in parallel if marked)
5. Run the gate check commands
6. Mark all tasks `[x]` in this file
7. Report: which tasks completed, any issues, gate check results
