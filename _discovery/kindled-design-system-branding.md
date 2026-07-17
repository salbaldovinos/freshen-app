# Freshen — Brand Identity & Design System

**Version:** 1.0 | **Last Updated:** March 18, 2026  
**App:** Freshen — Livestock Breeding & Due Date Tracker  
**Bundle ID:** `com.freshenapp.freshen` | **Domain:** freshenapp.com  
**Tagline:** Every new life starts here.

---

## Table of Contents

1. [Brand Foundation](#1-brand-foundation)
2. [The Mark](#2-the-mark)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Voice & Tone](#5-voice--tone)
6. [App Icon](#6-app-icon)
7. [UI Components](#7-ui-components)
8. [Brand Pattern](#8-brand-pattern)
9. [Touchpoints](#9-touchpoints)
10. [Implementation Reference](#10-implementation-reference)

---

## 1. Brand Foundation

### What Freshen Is

A focused, offline-first mobile app for tracking livestock breeding cycles. Users record pairings, track gestation countdowns, confirm pregnancies, and log births. It replaces the generic countdown-timer apps that small-scale goat and livestock breeders currently use.

The product's primary competitive advantage is its **breeding-only focus**. Every existing competitor bundles breeding inside a full farm management suite. Freshen does one thing exceptionally well.

### Aesthetic Direction

Warm organic editorial. Earthy, refined, and agricultural without being rustic or folksy. The visual language draws from seed catalogs, field journals, and the warmth of a working barn — not from startup aesthetics or generic productivity app design.

It should feel at home on the screen of a farmer standing in a pasture at 6am and equally at home in an App Store screenshot.

### Design Principles

**Grounded over polished.** Substance over flourish. No gradients for their own sake. No decorative illustrations that slow the eye.

**Precise over approximate.** Numbers and dates are facts to act on. Typography should make them readable at a glance in variable light conditions.

**Warm over clinical.** Color and type choices should feel like something you'd find in a well-made field notebook, not a medical records system.

**Quiet confidence.** The app earns trust by working. The brand doesn't oversell.

---

## 2. The Mark

### Description

A three-layer flame set beside the wordmark in Cormorant. The three layers can be read on two levels — both are intentional:

- **Literal:** Outer flame (energy), inner warmth, new life at center
- **Agricultural:** Dam (outer), sire (inner), offspring (center dot)

### SVG Mark Path Data

The mark is built from three paths within a `28 × 34` viewBox:

```
Outer flame (Ember):
M14 2C11 6 5.5 9.5 5.5 17C5.5 23.5 9.2 28.5 14 28.5C18.8 28.5 22.5 23.5 22.5 17C22.5 9.5 17 6 14 2Z

Inner flame (Harvest):
M14 9.5C12.2 13 10 15 10 19.5C10 22.8 11.7 25.2 14 25.2C16.3 25.2 18 22.8 18 19.5C18 15 15.8 13 14 9.5Z

Center dot (Parchment):
Circle: cx="14" cy="21.5" r="2.5"
```

### Logo Variants

| Variant | Background | Mark colors | Wordmark color |
|---|---|---|---|
| Primary — On Light | Parchment `#F7F2E8` | Full color (Ember + Harvest + Parchment) | Bark `#261C10` |
| Reversed — On Bark | Bark `#261C10` | Full color (Ember + Harvest + Parchment) | Parchment `#F7F2E8` |
| On Ember | Ember `#C4603A` | White (outer 30% opacity, inner 75%, dot solid) | White |

### Icon Mark Variants

| Variant | Description | Use case |
|---|---|---|
| Full color | Ember outer, Harvest inner, Parchment dot | Default — all brand applications |
| Single color | Ember only — outer flame shape | Monochrome print, embossing |
| Dark mono | Bark outer, Dusk inner, Flax dot | Light-on-dark contexts without color |
| Light mono on dark | Parchment outer 90%, 50%, dark dot 35% | On dark backgrounds, reversed contexts |

### Clear Space & Minimum Size

Minimum clear space: equal to the height of the flame mark on all sides.  
Minimum size: 22 × 22px (tab bar). At this size, the mark reads as a single Ember teardrop — this is acceptable.  
Minimum size with full detail: 40 × 40px.

Never place the mark on a background that reduces contrast below 3:1.

---

## 3. Color System

### Core Palette

Each color takes its name from the natural world the app serves.

| Token | Name | Hex | RGB | Use |
|---|---|---|---|---|
| `--ember` | Ember | `#C4603A` | 196, 96, 58 | Primary brand, buttons, icons, CTAs |
| `--harvest` | Harvest | `#D4A842` | 212, 168, 66 | Accent, Bred status badge, highlights |
| `--pasture` | Pasture | `#6B8F71` | 107, 143, 113 | Success states, Pregnant status |
| `--parchment` | Parchment | `#F7F2E8` | 247, 242, 232 | Page background, light surfaces |
| `--bark` | Bark | `#261C10` | 38, 28, 16 | Primary text, dark UI, nav |
| `--dusk` | Dusk | `#7A6652` | 122, 102, 82 | Secondary text, labels, supporting info |
| `--mist` | Mist | `#B8A898` | 184, 168, 152 | Placeholder text, disabled, captions |

### Extended Palette

```
Ember scale:
  --ember-deep:  #9E4A28   (pressed states, deep shadow)
  --ember-warm:  #D07048   (hover, mid-state)
  --ember-light: #E49070   (soft tints, icon outlines on dark)
  --ember-pale:  #F5E0D0   (background tints, error banners)

Harvest scale:
  --harvest-deep: #A87E22  (text on light harvest backgrounds)
  --harvest-light:#E8C870
  --harvest-pale: #FAF0D0  (badge backgrounds)

Pasture scale:
  --pasture-deep: #4E6E54  (text on light pasture backgrounds)
  --pasture-light:#9DB8A2
  --pasture-pale: #DDE9DE  (badge backgrounds)

Neutral scale:
  --bark-mid:    #4A3828   (body text, slightly lighter than primary)
  --sand:        #D8CCB8   (borders, dividers)
  --fog:         #EAE4DC   (hover states, subtle backgrounds)
  --flax:        #EDE5D2   (card borders, table lines)
  --cream:       #FDFAF4   (card backgrounds, section fills)
  --white:       #FFFFFF   (pure white, modal surfaces)
```

### Status Colors

These are the five states a breeding record can be in. Each has a background/text pair optimized for legibility as a pill badge.

| Status | Condition | Badge Background | Badge Text | Dot color |
|---|---|---|---|---|
| **Bred** | Pairing recorded, not confirmed pregnant | `#FEF4C0` | `#8A6A10` | `#D4A842` Harvest |
| **Pregnant** | `confirmedPregnant = true` | `#D5EDDA` | `#2C6E3C` | `#6B8F71` Pasture |
| **Overdue** | Today > dueDate, no birth logged | `#FFDCD4` | `#9E3A28` | `#C4603A` Ember |
| **Birth Logged** | Birth record exists for this breeding | `#D4E8F7` | `#1A5E8A` | `#3A7EB4` Blue |
| **Archived** | `archived = true` | `#EAE4DC` (Fog) | `#7A6652` (Dusk) | `#B8A898` Mist |

### Color Usage Rules

Do not use Ember at full opacity as a large background behind body text — reserve it for buttons, icons, and the app icon background.

Parchment is the default app background. Cream (`#FDFAF4`) is for card and section surfaces that sit on Parchment.

Never use Harvest as a text color on white — it fails contrast at small sizes. Use `--harvest-deep` (`#A87E22`) for text.

Bark (`#261C10`) is the only acceptable color for primary body text on light backgrounds.

---

## 4. Typography

### Typefaces

**Display / Wordmark — Cormorant**  
Source: Google Fonts (`https://fonts.google.com/specimen/Cormorant`)  
Weights used: 400, 500, 600, 700 | Italic: 400, 500  
CSS import:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap');
```

Cormorant carries warmth, history, and emotional weight. It has set legal documents, love letters, and seed catalogs. Use it for everything that carries meaning: animal names on cards, the wordmark, large stat numbers, screen titles, and the tagline.

**Interface / Body — DM Sans**  
Source: Google Fonts (`https://fonts.google.com/specimen/DM+Sans`)  
Weights used: 300, 400, 500, 600 | Optical size: 9–40  
CSS import:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
```

DM Sans handles the functional interface. Readable at a glance in conditions that are rarely ideal — bright sun, dim barn, gloved hands.

**Monospace — Courier New (system)**  
For developer-facing documentation, code snippets, and hex value labels in the design system. Never used in the app UI.

### Type Scale

| Role | Typeface | Size | Weight | Line Height | Use |
|---|---|---|---|---|---|
| Display | Cormorant | 56px | 600 | 1.0 | Stat numbers (`Day 47`), hero text |
| H1 | Cormorant | 36px | 500 | 1.1 | Screen titles (`Breeding Records`) |
| H2 | Cormorant | 24px | 500 | 1.2 | Card animal names, section heads |
| Label Large | DM Sans | 16px | 500 | 1.4 | CTA buttons, primary form labels |
| Body | DM Sans | 15px | 400 | 1.75 | Main copy, descriptions, notes |
| Label Small | DM Sans | 13px | 400 | 1.65 | Supporting info, sire name, metadata |
| Caption / Badge | DM Sans | 11px | 500 | 1.4 | Uppercase badges, tags, eyebrows |

### Typography Rules

Animal names on cards use Cormorant H2 (24px / 500). This is one of the most-seen elements in the app — make it warm.

Stat numbers (Days Bred, Days Left, Due Date) use Cormorant Display weight (56px / 600). These are facts to act on.

All UI copy is sentence case. Never title case for body copy or button labels. Reserve all caps exclusively for pill badges and uppercase eyebrow labels, both set at 11px / 500 / 0.06–0.14em letter-spacing.

Letter spacing for uppercase labels: `0.06em` to `0.16em`. Never add letter spacing to Cormorant display text — it disrupts the optical spacing of the serif.

---

## 5. Voice & Tone

### Brand Personality

Freshen speaks like a thoughtful farmer who also cares about design: knowledgeable without being clinical, warm without being sentimental, precise without being cold. Every word earns its place.

### Four Personality Pillars

**Warm**
The app understands the care behind every breeding decision. It honors the stakes without dramatizing them.
> *"Daisy is due tomorrow. Watch closely."*

**Grounded**
No tech-speak. No app-store hype. Freshen talks the way farmers talk — plainly, with respect for practical knowledge.
> *"3 active breedings. Nearest due: 7 days."*

**Precise**
Numbers matter. A due date is a promise. "Day 47" is a fact to act on — not an approximation with wiggle room.
> *"Estimated due date: May 31, 2026."*

**Quiet Confidence**
Freshen doesn't oversell. It earns trust by working reliably in a barn with no internet and costing less than a bag of feed per year.
> *"Breeding record saved."*

### Do Write Like This

- Short confirmations: "Breeding record saved." — short and done, no exclamation
- Use the animal's name in notifications and success messages
- Acknowledge the weight of overdue records ("No birth logged yet." — not "Oops!")
- Specific numbers over vague assurances ("3 days" not "soon")
- Sentence case everywhere in the UI
- Plain active voice: "Tap + to add your first entry."

### Don't Write Like This

- Startup-y copy with emoji: "Syncing your herd data! 🎉"
- Over-celebrating routine saves: "Amazing! Your record was saved!"
- Accusatory error messages: "You forgot to enter an animal name."
- Passive voice for important actions: "The record could not be saved."
- ALL CAPS in body copy or descriptions

### Copy Reference

| Context | Copy |
|---|---|
| Empty state | "No breeding records yet. Tap + to add your first entry." |
| Save success | "Breeding record saved." |
| Delete success | "Record deleted." |
| Pregnancy confirmed | "Pregnancy confirmed for [animal name]." |
| Birth logged | "Birth logged for [animal name]." |
| Overdue card banner | `● Overdue — [N] days past due` |
| Notification: 7 days | "Daisy is due in 7 days." |
| Notification: tomorrow | "Daisy is due tomorrow! Prepare the birthing area." |
| Notification: due today | "Daisy is due today. Watch closely." |
| Notification: overdue | "Daisy was due yesterday. No birth logged yet." |
| Free tier limit | "You've reached the 10-animal limit on the free plan. Upgrade to track unlimited animals." |
| Upgrade headline | "Upgrade to Freshen Pro" |
| Upgrade subhead | "$9.99/year — less than $1/month" |
| Restore success | "Purchase restored successfully." |
| Offline sync banner | "Working offline — your data is saved locally and will sync when you reconnect." |

---

## 6. App Icon

### Construction

The Freshen icon is the flame mark centered on a full-bleed Ember (`#C4603A`) background. On the icon, the mark is rendered in white/near-white rather than the full-color version used in the wordmark — this ensures legibility against the colored background at small sizes.

**Icon mark colors (on Ember background):**
- Outer flame: `rgba(255,255,255,0.95)`
- Inner flame: `#D4A842` (Harvest — this layer retains color for warmth and differentiation)
- Center dot: `rgba(255,255,255,0.25)` (subtle, not distracting at small sizes)

### iOS Required Sizes

| Size (px) | Context | Corner Radius |
|---|---|---|
| 1024 × 1024 | App Store Connect submission | 0 (Apple applies mask) |
| 120 × 120 | @2× Home Screen | 26px |
| 80 × 80 | @2× Spotlight Search | 18px |
| 58 × 58 | Settings | 12px |
| 40 × 40 | @2× Notification | 8px |
| 22 × 22 | @2× Tab Bar | 4px |

Use EAS to generate all required sizes from the 1024 × 1024 master via `expo-image` in `app.json`.

### Android Adaptive Icon

The adaptive icon uses the same Ember background with the white/Harvest flame mark centered.

- **Circle mask:** Ember fill, flame mark centered
- **Rounded square mask:** 16px corner radius, same construction
- Foreground layer: flame mark at 108dp canvas, mark centered in safe zone
- Background layer: solid Ember `#C4603A`

### App Store Listing Card

App name: **Freshen**  
Subtitle: **Livestock Breeding Tracker**  
The icon appears at 64 × 64px with a 16px corner radius in the listing card.

---

## 7. UI Components

All components are built on **react-native-reusables** with **NativeWind v4**. Every element inherits the brand's color tokens and typography via Tailwind CSS variables defined in `tailwind.config.js`.

### Buttons

Four button variants. All use DM Sans 14px / 500.

| Variant | Background | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--ember` `#C4603A` | White | None | Save, submit, primary CTA |
| Secondary | Transparent | `--ember` | 1.5px `--ember` | Edit, secondary action |
| Ghost | Transparent | `--dusk` | 1px `--sand` | Cancel, neutral action |
| Destructive | Transparent | `#B34030` | 1.5px `#EAC0BB` | Delete record, irreversible action |

Button border radius: 8px (`--r-md`). Standard padding: 9px 18px.

For full-width CTA buttons (paywall, onboarding): border radius 100px.

Loading state: replace button label with a spinner, disable interaction, maintain button dimensions.

### Status Badges

Pill shape (border-radius 100px). DM Sans 11px / 500, uppercase, 0.06em letter-spacing.

```
Bred:          bg #FEF4C0   text #8A6A10
Pregnant:      bg #D5EDDA   text #2C6E3C
Overdue:       bg #FFDCD4   text #9E3A28
Birth Logged:  bg #D4E8F7   text #1A5E8A
Archived:      bg #EAE4DC   text #7A6652
```

Padding: 4px 10px.

### Breeding Card

The core repeating element of the app. Each card represents one breeding record.

**Structure:**

```
[Optional: Overdue banner — full width, Ember pale background]
[Card body: 16px 18px 18px padding]
  [Top row]
    Animal name (Cormorant 24px / 600, Bark)
    Sire name (DM Sans 13px, Mist) — "× [Sire Name]" or "Sire unknown"
    [Status badge — right aligned]
  [Stats row — separated by 1px Flax top border, 14px margin-top]
    Days Bred   |   Days Left   |   Due Date   |   [Color dot]
    (Cormorant 26px / 500)
    (DM Sans 10px uppercase Mist label beneath each)
```

**Card styling:**
- Background: White `#FFFFFF`
- Border: 1px `--flax` `#EDE5D2`
- Border radius: 14px (`--r-lg`)
- Shadow: `0 1px 6px rgba(38,28,16,0.06)`

**Overdue banner (when applicable):**
- Background: `--ember-pale` `#F5E0D0`
- Text: DM Sans 10px / 600, uppercase, 0.10em letter-spacing, `--ember-deep`
- Content: `● Overdue — [N] days past due`

**Stat number colors:**
- Normal: Bark `#261C10`
- Overdue (Days Left is negative): Ember `#C4603A`

**Color dot:** 10px circle, bottom-right of stats row. Reflects the user's assigned color tag for the record. Default: Pasture `#6B8F71`.

### Long-Press Action Sheet

Sheet options (in order):
1. Edit Entry
2. Mark Pregnant *(only if `confirmedPregnant = false`)*
3. Log Birth
4. Archive *(only if no birth logged)*
5. Delete *(destructive — red text)*

### Form Inputs

- Background: White
- Border: 1px `--sand` default, 1.5px `--ember` on focus, 1.5px `#B34030` on error
- Border radius: 8px
- Label: DM Sans 13px / 500, Bark, above field
- Placeholder: DM Sans 14px / 400, Mist
- Error message: DM Sans 13px / 400, `#9E3A28`, below field

### Empty State

Centered in the screen. Vertically centered between the nav and the FAB.

```
[Flame mark at 64px height, 30% opacity]
[Cormorant 20px / 500, Bark]: "No breeding records yet."
[DM Sans 14px / 400, Mist]: "Tap + to add your first entry."
[Primary button, full width, max 240px]: "+ Add First Record"
```

### Skeleton Loading

Three gray placeholder cards visible during the SQLite query on app launch. Use `--fog` `#EAE4DC` for skeleton fill with a shimmer animation. Cards should match the approximate height of a real breeding card.

### Sync Status Indicator

Small icon in the home screen header, right-aligned. Three states:

| State | Icon | Color |
|---|---|---|
| Connected & synced | Cloud with checkmark | Pasture green |
| Syncing | Cloud with animated arrows | `#3A7EB4` Blue |
| Offline | Cloud with slash | Mist gray |

Only shown for paid-tier authenticated users. Tapping opens a bottom sheet with last-sync time or offline message.

---

## 8. Brand Pattern

A repeating tile of the flame mark used in empty states, loading screens, App Store screenshots, and dark section backgrounds.

**Construction:**  
Two offset SVG `<pattern>` layers on a Bark `#261C10` background:

- Layer 1: Flame mark at 20% Ember opacity, 48px × 58px tile
- Layer 2: Same flame mark at 10% Harvest opacity, offset by `(+24px, +29px)` — half the tile size

At viewing distance the pattern reads as warmth and earthy texture. Up close it tells the brand story.

**SVG pattern definition:**

```svg
<defs>
  <pattern id="freshen-pattern-ember" x="0" y="0"
           width="48" height="58" patternUnits="userSpaceOnUse">
    <path d="M24 6C21 11 16 14.5 16 21C16 26 19 30 24 30C29 30 32 26 32 21C32 14.5 27 11 24 6Z"
          fill="#C4603A" opacity="0.22"/>
  </pattern>
  <pattern id="freshen-pattern-harvest" x="24" y="29"
           width="48" height="58" patternUnits="userSpaceOnUse">
    <path d="M24 6C21 11 16 14.5 16 21C16 26 19 30 24 30C29 30 32 26 32 21C32 14.5 27 11 24 6Z"
          fill="#D4A842" opacity="0.12"/>
  </pattern>
</defs>
<rect width="100%" height="100%" fill="#261C10"/>
<rect width="100%" height="100%" fill="url(#freshen-pattern-ember)"/>
<rect width="100%" height="100%" fill="url(#freshen-pattern-harvest)"/>
```

---

## 9. Touchpoints

### Push Notification

Title and body reference the animal by name. Icon uses the Ember background with the white/Harvest flame mark.

```
[Icon: Ember square, flame mark]
Title (DM Sans 13px / 500, Bark):    "Due date tomorrow"
Body  (DM Sans 12px / 400, Dusk):    "Daisy is due tomorrow! Prepare the birthing area."
Time  (DM Sans 11px, Mist):          "now"
```

Notification copy by timing:

| When | Title | Body |
|---|---|---|
| 7 days before | "Due date coming up" | "[Name] is due in 7 days." |
| 3 days before | "Due date coming up" | "[Name] is due in 3 days. Prepare the birthing area." |
| 1 day before | "Due date tomorrow" | "[Name] is due tomorrow!" |
| Due date | "Due today" | "[Name] is due today. Watch closely." |
| 1 day overdue | "Overdue" | "[Name] was due yesterday. No birth logged yet." |

### Splash Screen

Dark Bark background. Flame mark at 52px height. Wordmark below in Cormorant 28px / 600, Parchment. Tagline below in DM Sans 12px, Mist, 0.12em letter-spacing.

### iOS Home Screen Widgets

**Small widget — Next Due Date:**  
Background: Ember. Text: White.  
Label: "Next Due Date" (DM Sans 10px / 500, uppercase, 80% opacity)  
Number: Cormorant 36px / 600 (days remaining)  
Subtext: "days · [Animal Name]" (DM Sans 12px, 75% opacity)

**Small widget — Active Breedings:**  
Background: Bark. Text: Parchment.  
Label: "Active Breedings" (DM Sans 10px / 500, uppercase, Mist)  
Number: Cormorant 28px / 600, Parchment  
Subtext: "1 due this week" (DM Sans 12px, Mist)

---

## 10. Implementation Reference

### CSS Custom Properties

```css
:root {
  /* Primary palette */
  --ember:         #C4603A;
  --ember-deep:    #9E4A28;
  --ember-warm:    #D07048;
  --ember-light:   #E49070;
  --ember-pale:    #F5E0D0;

  --harvest:       #D4A842;
  --harvest-deep:  #A87E22;
  --harvest-light: #E8C870;
  --harvest-pale:  #FAF0D0;

  --pasture:       #6B8F71;
  --pasture-deep:  #4E6E54;
  --pasture-light: #9DB8A2;
  --pasture-pale:  #DDE9DE;

  --bark:          #261C10;
  --bark-mid:      #4A3828;
  --dusk:          #7A6652;
  --mist:          #B8A898;
  --sand:          #D8CCB8;
  --fog:           #EAE4DC;
  --flax:          #EDE5D2;
  --parchment:     #F7F2E8;
  --cream:         #FDFAF4;

  /* Typography */
  --font-display: 'Cormorant', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
  --font-mono:    'Courier New', monospace;

  /* Border radius scale */
  --r-sm:  4px;
  --r-md:  8px;
  --r-lg:  14px;
  --r-xl:  20px;
  --r-2xl: 28px;
}
```

### NativeWind / Tailwind Config Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ember: {
          DEFAULT: '#C4603A',
          deep:    '#9E4A28',
          warm:    '#D07048',
          light:   '#E49070',
          pale:    '#F5E0D0',
        },
        harvest: {
          DEFAULT: '#D4A842',
          deep:    '#A87E22',
          light:   '#E8C870',
          pale:    '#FAF0D0',
        },
        pasture: {
          DEFAULT: '#6B8F71',
          deep:    '#4E6E54',
          light:   '#9DB8A2',
          pale:    '#DDE9DE',
        },
        bark: {
          DEFAULT: '#261C10',
          mid:     '#4A3828',
        },
        dusk:      '#7A6652',
        mist:      '#B8A898',
        sand:      '#D8CCB8',
        fog:       '#EAE4DC',
        flax:      '#EDE5D2',
        parchment: '#F7F2E8',
        cream:     '#FDFAF4',
      },
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:  '4px',
        md:  '8px',
        lg:  '14px',
        xl:  '20px',
        '2xl': '28px',
      },
    },
  },
};
```

### Constants File Reference

```typescript
// constants/app.ts — single source of truth for branding
export const APP_NAME           = 'Freshen';
export const APP_TAGLINE        = 'Every new life starts here.';
export const APP_STORE_SUBTITLE = 'Livestock Breeding & Due Date Tracker';
export const BUNDLE_ID          = 'com.freshenapp.freshen';
export const SUPPORT_EMAIL      = 'support@freshenapp.com';
export const PRIVACY_POLICY_URL = 'https://freshenapp.com/privacy';
```

```typescript
// constants/theme.ts — design token reference in code
export const COLORS = {
  ember:     '#C4603A',
  emberDeep: '#9E4A28',
  emberPale: '#F5E0D0',
  harvest:   '#D4A842',
  pasture:   '#6B8F71',
  parchment: '#F7F2E8',
  bark:      '#261C10',
  barkMid:   '#4A3828',
  dusk:      '#7A6652',
  mist:      '#B8A898',
  sand:      '#D8CCB8',
  fog:       '#EAE4DC',
  flax:      '#EDE5D2',
  cream:     '#FDFAF4',
} as const;

export const STATUS_COLORS = {
  bred:        { bg: '#FEF4C0', text: '#8A6A10' },
  pregnant:    { bg: '#D5EDDA', text: '#2C6E3C' },
  overdue:     { bg: '#FFDCD4', text: '#9E3A28' },
  birthLogged: { bg: '#D4E8F7', text: '#1A5E8A' },
  archived:    { bg: '#EAE4DC', text: '#7A6652' },
} as const;

export const RADIUS = {
  sm:  4,
  md:  8,
  lg:  14,
  xl:  20,
  xxl: 28,
} as const;
```

### Color Tag Options (User-Assignable per Record)

Eight preset colors available in the Add/Edit form color swatch picker:

```typescript
export const COLOR_TAGS = [
  { name: 'Gray',   value: 'gray',   hex: '#B8A898' },
  { name: 'Ember',  value: 'ember',  hex: '#C4603A' },
  { name: 'Orange', value: 'orange', hex: '#D4813A' },
  { name: 'Harvest',value: 'yellow', hex: '#D4A842' },
  { name: 'Pasture',value: 'green',  hex: '#6B8F71' },
  { name: 'Teal',   value: 'teal',   hex: '#4A8F8A' },
  { name: 'Blue',   value: 'blue',   hex: '#3A7EB4' },
  { name: 'Purple', value: 'purple', hex: '#7B5EA7' },
] as const;
```

---

## Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-03-18 | Initial brand identity and design system |

---

*Freshen — Brand Identity Guidelines*  
*Bundle ID: com.freshenapp.freshen · freshenapp.com · support@freshenapp.com*
