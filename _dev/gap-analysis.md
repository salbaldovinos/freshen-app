# Freshen — Discovery Document Gap Analysis

**Date:** 2026-03-18
**Documents reviewed:**
- `_discovery/livestock-breeding-tracker-PRD-v1.1.md` (PRD)
- `_discovery/kindled-design-system-branding.md` (Design System)
- `_discovery/feasibility-analysis.md` (Feasibility)
- `_stitch/` screenshots (8 screens: home_empty, home_populated, add_entry, add_entry_error, action_sheet, log_birth, settings, upgrade_pro)

---

## Note on Stitch Screenshots

The screenshots in `_stitch/` are **aesthetic references and design inspiration**, not final layouts. Navigation structures, field ordering, tab counts, and header configurations shown in the screenshots may differ from each other and from the PRD — this is expected. **The PRD is the source of truth for layout and functionality.** The screenshots inform the visual language: color palette, typography feel, component styling, spacing rhythm, and overall warmth.

Where the screenshots surface a visual pattern worth adopting (e.g., the due date preview callout card, the stepper controls on the birth form, the overdue banner treatment), those are noted. Where they introduce UI elements not in the PRD (e.g., a Dam field, Import from CSV), those are flagged as decisions to make — not as errors.

---

## 1. Brand Alignment — Design System vs. Screenshots

### 1.1 Screenshots Are On-Brand

The stitch screenshots are **strongly aligned** with the design system's aesthetic direction. Key brand elements are consistently present:

- **Color palette:** Parchment backgrounds, Ember CTAs, Bark text, and the warm neutral scale are used correctly throughout. The status badge colors (yellow/Bred, green/Pregnant, red/Overdue) match the design system spec.
- **Typography pairing:** Cormorant for display text (animal names, screen titles, stat numbers) and DM Sans for interface text (labels, buttons, body copy) is used consistently across all screens.
- **Warmth over clinical:** The overall feel is earthy, grounded, and agricultural — matching the "seed catalog / field journal" direction. No screen drifts into generic startup or clinical territory.
- **Component styling:** Card borders, badge pills, form inputs, and button shapes follow the design system's radius and shadow specs.
- **Brand mark:** The flame mark appears correctly in the upgrade paywall and empty state screens.

### 1.2 Notification Content — Emoji Conflicts with Brand Voice

**Severity: Medium**

The PRD (Feature 2.5) includes goat emoji in notification text: `"🐐 [Animal Name] is due in 7 days!"`. The Design System's Voice & Tone section explicitly says **"Don't Write Like This: Startup-y copy with emoji."** The Design System's notification copy reference (Section 9) does **not** include emoji.

**Recommendation:** Remove emoji from notification copy in the PRD to match the brand voice guidelines. The design system's emoji-free notification copy is the correct reference.

### 1.3 Color Tag Values — Design System vs. PRD Zod Schema

**Severity: Medium**

The Zod schema in the PRD (Part 4) defines color enum values as:
```
'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple'
```

The Design System's `COLOR_TAGS` array uses:
```
'gray', 'ember', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple'
```

The value `'red'` in the Zod schema corresponds to `'ember'` in the design system. These must match or the Zod validation will reject records saved with the design system's color values.

**Recommendation:** Update the Zod schema to use `'ember'` instead of `'red'` to match the design system's token naming. The design system is the branding authority.

### 1.4 Birth Notes Character Limit — PRD vs. Screenshot

**Severity: Low**

- The PRD (Feature 1.5) specifies birth notes max length as **300 characters**.
- The `log_birth` screenshot shows a counter of **"0/500"**, implying a 500-character limit.
- The breeding record notes field is 500 characters per the PRD — the 500 shown in the screenshot may be a carry-over from that field.

**Recommendation:** Decide on 300 (PRD) or 500 and align. 300 seems intentionally smaller for birth-specific notes; recommend keeping the PRD's value.

---

## 2. Functional Gaps — Things Missing or Underspecified

### 2.1 No Breeding Detail Screen Spec

**Severity: High**

The PRD references a "breeding detail screen" in Feature 1.4 ("button on breeding detail screen" to mark pregnant) and states multiple birth records should be shown "on the breeding detail screen in a list" (Feature 1.5). However, **no feature section defines this screen**. There is no functional flow, no layout spec, no acceptance criteria, and no stitch screenshot for a detail view.

This screen would logically show: full breeding record info, pregnancy status toggle, birth history list, photo (v1.0), and notes. Without a spec, developers will either skip it (breaking the "mark pregnant from detail" flow) or improvise it.

**Recommendation:** Add a Feature 1.7 — Breeding Detail Screen section to the PRD with layout, states, and acceptance criteria.

### 2.2 No Animal Management / Animal List

**Severity: Medium**

The CLAUDE.md project structure lists `app/animal/[id].tsx` (Animal detail / lineage) and `db/queries/animals.ts`, implying an animals table and management feature. The PRD has **no animals table in the schema** — animals exist only as `animalName` text fields on breeding records. There is no `animals` table defined, no animal CRUD, and no lineage feature.

The feasibility doc's free-tier limit says "Up to 10 animals" — but how are "animals" counted if there's no animals table? Does the app count distinct `animalName` values across breeding records?

**Recommendation:** Either (a) add an `animals` table to the schema and a Feature section defining animal management, or (b) remove `animal/[id].tsx` and `db/queries/animals.ts` from CLAUDE.md and clarify that "10 animals" means "10 distinct animal names across breeding records."

### 2.3 `photo_url` Column Missing from SQLite Schema

**Severity: Medium**

Feature 2.4 (Photos) references `breeding_records.photo_url` and the Supabase SQL schema does not include it. The SQLite schema in Feature 1.2 also omits `photo_url`. The PRD mentions adding it as a task ("Add photo_url column to breeding_records schema + migration") but never defines the column in the schema block.

**Recommendation:** Add `photoUrl: text('photo_url')` to the `breedingRecords` table definition in the schema section, and add `photo_url TEXT` to the Supabase SQL schema.

### 2.4 No `dueDate` Column in Schema — Calculated or Stored?

**Severity: Medium**

The SQLite schema stores `pairingDate` and `gestationDays` but has **no `dueDate` column**. The `getBreedingStatus()` function signature expects a `dueDate` string parameter, and every card displays a due date. The Supabase schema also omits a `dueDate` column.

Is `dueDate` always calculated on-the-fly from `pairingDate + gestationDays`? If so, this needs to be clarified — and sorting by due date requires calculating it before sorting, not a simple SQL `ORDER BY`.

**Recommendation:** Either add a `dueDate` stored column (simpler queries, especially for sorting and notifications) or explicitly document in the PRD that `dueDate` is always derived and provide the sort query pattern.

### 2.5 No Settings Screen Spec in PRD

**Severity: Medium**

The PRD references Settings in multiple places (notification preferences, account management, export access) and the project structure lists `app/(tabs)/settings.tsx`, but **no Feature section defines the Settings screen layout**. The `settings` screenshot provides a strong visual reference for sections (Account, Notifications, Data, About) but the PRD should formalize the spec.

**Recommendation:** Add a Settings screen feature section to the PRD documenting the layout, sections, and behavior of each setting option.

### 2.6 Free Tier — Birth Logging Discrepancy

**Severity: Medium**

The feasibility analysis states free-tier birth logging is **"View only"** — implying free users can see births but cannot log them. The PRD does **not** gate birth logging behind the paid tier. Birth logging is an MVP feature (Part 1) with no tier checks mentioned.

**Recommendation:** Clarify in the PRD. If birth logging is truly free, update the feasibility doc's tier table. If it's view-only for free users, add the restriction to `lib/tierChecks.ts` and the PRD's Feature 2.2.

### 2.7 Free Tier — Color Customization Discrepancy

**Severity: Low**

The feasibility analysis says color customization is free-tier: "Default only" (locked to gray). The PRD's Add form includes the color picker for all users with no tier gate mentioned. The design system defines 8 color tags with no tier distinction.

**Recommendation:** Either add `canCustomizeColor(tier)` to `tierChecks.ts` or remove color from the paid feature list in the feasibility doc.

### 2.8 No Dark Mode Specification

**Severity: Low**

The design system defines only a light theme. The feasibility analysis and PRD do not mention dark mode. This is fine for v1.0, but should be explicitly called out as "not supported" to prevent it from becoming an implicit expectation.

**Recommendation:** Add a note to the design system: "Dark mode is not supported in v1.0. The color system is designed for light mode only."

---

## 3. PRD Internal Issues

### 3.1 Gestation Calculation Test Has a Typo

**Severity: Low**

Line 263 of the PRD:
```
calculateDueDate("2026-01-01", 150) → "2026-06-00" (Jan 1 + 150 days = May 31, 2026)
```

`"2026-06-00"` is not a valid date. The next line corrects it to `"2026-05-31"` — but the erroneous line should be removed to prevent confusion.

**Recommendation:** Delete the line with the wrong expected value.

### 3.2 Acceptance Criteria Error — Wrong Field Cited

**Severity: Low**

In Feature 1.2 acceptance criteria:
```
Given I enter a pairing date of tomorrow
When I tap Save
Then Animal Name field shows error "Pairing date cannot be in the future."
```

The error should appear on the **Pairing Date field**, not the Animal Name field. This is a copy error.

**Recommendation:** Fix to: "Then Pairing Date field shows error..."

### 3.3 `canAccessSpecies` Restricts Free Tier to Goats Only

**Severity: Low**

The `canAccessSpecies()` function in tierChecks returns false for free-tier users selecting non-goat species. The feasibility doc says free tier = "1 species (goats)." This seems intentional but could frustrate free users who have sheep or rabbits.

**Recommendation:** Consider allowing 2-3 species on the free tier (goat + sheep + rabbit are most common small-farm animals) and restricting the full 7-species list to paid. Or keep as-is but document the rationale.

---

## 4. Implementation Readiness Gaps

### 4.1 Cormorant Font Loading in React Native

**Severity: Medium**

The design system specifies Cormorant as the display typeface. React Native does not support Google Fonts CSS imports. Custom fonts in Expo require:
1. Downloading the font files (.ttf/.otf)
2. Adding them to an `assets/fonts/` directory
3. Loading via `expo-font` or `useFonts` hook
4. Handling the loading state (splash screen must remain until fonts load)

Neither the PRD nor the design system documents this setup. The project structure in CLAUDE.md doesn't list an `assets/fonts/` directory.

**Recommendation:** Add font setup to the Phase 1 scaffold checklist. Document the exact Cormorant weights needed (400, 500, 600, 700, Italic 400, 500) and DM Sans weights (300, 400, 500, 600).

### 4.2 No Mention of `date-fns` in Feasibility Doc

**Severity: Low**

The PRD mandates using `date-fns` for all date math ("already included with Expo"). The feasibility analysis does not mention `date-fns` in the tech stack. It should be listed as a dependency since it's a critical requirement for the gestation calculation logic.

### 4.3 Free Trial Trigger Not Defined in PRD

**Severity: Low**

The feasibility doc recommends a 7-day trial "upon first install." The PRD only shows the paywall on specific triggers (animal limit, feature gate, contextual upsell). There's no "first install" trial trigger in the PRD.

**Recommendation:** Clarify whether the 7-day trial starts automatically on first install or only when the user hits a paywall. The PRD's trigger-based approach is more aligned with a freemium model.

---

## 5. Summary — Priority Action Items

| Priority | Item | Action |
|---|---|---|
| **P0** | Breeding detail screen missing | Add Feature section to PRD |
| **P1** | Animals table undefined | Decide schema approach, update CLAUDE.md |
| **P1** | `dueDate` stored vs. calculated | Document the approach |
| **P1** | `photo_url` missing from schema | Add to both SQLite and Supabase schemas |
| **P1** | Settings screen unspecified | Add Feature section to PRD |
| **P1** | Color tag enum mismatch | Align Zod schema with design system (`'ember'` not `'red'`) |
| **P1** | Birth logging free-tier gate | Clarify in PRD and feasibility doc |
| **P1** | Font loading for React Native | Add to scaffold checklist |
| **P2** | Emoji in notifications vs. brand voice | Remove emoji from PRD notification copy |
| **P2** | Birth notes char limit (300 vs. 500) | Pick one, update both docs |
| **P2** | Color customization free-tier gate | Align PRD and feasibility doc |
| **P2** | Acceptance criteria typo (wrong field) | Fix in PRD |
| **P2** | Gestation test typo | Remove erroneous line |
| **P3** | Dark mode explicitly excluded | Add note to design system |
| **P3** | `date-fns` in feasibility doc | Add to dependency list |
| **P3** | Free trial trigger clarity | Document trigger mechanism |
| **P3** | Free-tier species restriction rationale | Document or expand |

---

## 6. Overall Assessment

The three discovery documents are **substantially well-aligned** and remarkably thorough. The PRD is one of the most implementation-ready specs for a project of this scope — with Gherkin acceptance criteria, exact error messages, schema definitions, and task checklists. The design system is cohesive, and the stitch screenshots demonstrate that the warm, earthy visual identity translates well to actual mobile screens.

**The brand is solid.** The color palette, typography pairing (Cormorant + DM Sans), component styling, and voice/tone guidelines come through consistently across all the stitch screens. The aesthetic hits the "seed catalog meets field journal" target without veering into rustic kitsch or generic productivity app territory.

The primary risks before implementation:

1. **The breeding detail screen is the biggest functional gap.** Multiple features reference it but no spec exists. This screen will be one of the most-visited in the app and needs full definition.

2. **The animal/breeding-record data model ambiguity** (is an "animal" a first-class entity or just a name string?) affects the free-tier counting logic, the lineage feature referenced in CLAUDE.md, and the v2.0 pedigree charts mentioned in the feasibility doc. This architectural decision should be made before Phase 1 scaffold.

3. **Schema completeness** — `photo_url` and `dueDate` need to be explicitly addressed before the Drizzle schema is written.

With these items resolved, the project is ready to begin implementation.
