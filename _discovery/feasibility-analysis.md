# Livestock breeding tracker: full feasibility analysis

**A purpose-built breeding tracker for goats and small livestock is not only feasible — it targets a genuine market gap with no dominant competitor.** The recommended stack of React Native + Expo SDK 55, Supabase with PowerSync for offline-first sync, and RevenueCat for monetization delivers the client's full feature set at under $2,500 in first-year infrastructure costs. The MVP can ship in 3–4 weeks using Claude Code, with a production-ready v1.0 on both app stores within 4 months. No existing app focuses solely on breeding workflow management; every competitor bundles it inside a bloated farm management suite, creating a clear opening for a lean, focused product priced at **$9.99/year**.

---

## The recommended tech stack and why it wins

**React Native + Expo SDK 55** with Expo Router is the definitive choice across every evaluation criterion. Expo SDK 55, released February 2026 with React Native 0.83 and the New Architecture enabled by default, provides a single TypeScript codebase for iOS and Android with native performance. The decision hinges on three factors the client specified: shadcn-compatible UI, Claude Code as the build tool, and offline support for rural environments.

**react-native-reusables** (~8,000 GitHub stars) is the de facto shadcn/ui port for React Native. Built on NativeWind v4 (Tailwind CSS for RN) and Radix UI primitive ports, it mirrors shadcn's copy-paste philosophy exactly. Components include buttons, forms, cards, sheets, dialogs, and navigation — everything the breeding tracker needs. No equivalent exists for Flutter, and while Capacitor can use actual web shadcn/ui, its WebView rendering creates performance problems on the low-end Android devices common in agricultural settings.

Claude Code's **full TypeScript LSP support** — go-to-definition, find references, hover info, document symbols — gives it deep code intelligence for React Native projects. A dedicated `claude-code-reactnative-expo-agent-system` with 7 production-ready agents exists, and Callstack (React Native core contributors) published official AI agent skills for the ecosystem. By contrast, **Claude Code does not support Dart LSP** (confirmed via GitHub issue #16849), making Flutter a significantly weaker choice for AI-assisted development. Production teams report **50% reductions in development time** using Claude Code with React Native.

| Criterion | React Native + Expo | Flutter | Capacitor | PWA |
|---|---|---|---|---|
| Single codebase | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Good |
| shadcn compatibility | ✅ react-native-reusables | ❌ None | ✅ Native shadcn/ui | ✅ Native shadcn/ui |
| Claude Code support | ✅ Full LSP + plugins | ⚠️ No Dart LSP | ✅ Good (web stack) | ✅ Good (web stack) |
| Offline support | ✅ SQLite + PowerSync | ✅ sqflite/hive | ⚠️ WebView limits | ❌ 50MB iOS limit |
| App store submission | ✅ EAS Build/Submit | ✅ Codemagic/Fastlane | ⚠️ Risk of 4.2 rejection | ❌ Apple rejects PWAs |
| Rural device performance | ✅ Native rendering | ✅ Skia/Impeller | ⚠️ WebView overhead | ❌ Storage eviction |
| Push notifications | ✅ Free Expo Push Service | ✅ Firebase required | ✅ Capacitor plugin | ❌ iOS Home Screen only |

**PWA is definitively not viable.** iOS limits PWA offline storage to ~50MB with automatic eviction after 7 days of inactivity, Apple rejects PWA submissions to the App Store, and push notifications require the app to be manually added to the Home Screen. For a livestock app used in barns with intermittent connectivity, these are dealbreakers.

---

## Architecture: offline-first with Supabase and PowerSync

The architecture solves the fundamental constraint of agricultural mobile apps: **farms have unreliable internet**. Every read and write happens against a local SQLite database. Cloud sync occurs opportunistically in the background when connectivity is available.

**Supabase** (Postgres + Row Level Security + Auth + Storage) serves as the cloud backend. Postgres is ideal for the relational nature of breeding data — animals have parents, offspring, breeding events, and birth records with many-to-many relationships that NoSQL databases handle poorly. Row Level Security ensures each user's data is isolated at the database level. Supabase Auth provides **50,000 MAUs free** with email, social login, and anonymous auth. Supabase Storage handles photo uploads at 1 GB free, 100 GB on the $25/month Pro plan.

**PowerSync** bridges the offline gap that Supabase alone cannot fill. Supabase has no native offline-first capability — it is the most-requested feature in the Supabase GitHub org. PowerSync monitors the Postgres write-ahead log and streams changes to client-side SQLite databases, with bidirectional sync and conflict resolution. The React Native SDK ships with **attachment sync** (added February 2026), which handles photo synchronization. PowerSync is free for up to 50 concurrent connections and 500 MB hosted data.

**The free/paid tier split maps cleanly onto this architecture.** Free users get local-only SQLite storage via Drizzle ORM and expo-sqlite — zero cloud infrastructure cost per free user. Paid users unlock PowerSync cloud sync, Supabase Storage for photos, and cross-device data access. This makes the marginal cost of serving free users exactly $0.

| Phase | Monthly Cost | Capacity |
|---|---|---|
| MVP (0–100 users) | $0 | Supabase Free + PowerSync Free |
| Growth (100–1,000 users) | $74 | Supabase Pro ($25) + PowerSync Pro ($49) |
| Scale (1,000–5,000 users) | ~$100–150 | Same plans with minor overage |

**MongoDB Realm/Atlas Device Sync is dead** — deprecated September 2024, fully shut down September 30, 2025. Firebase/Firestore is a viable alternative if simplicity is paramount, as Firestore includes built-in offline caching. However, its pay-per-read/write model becomes expensive at scale (5,000 users generating 250K reads/day costs ~$135/month in reads alone), and its NoSQL document model is poorly suited for relational breeding lineage data. ElectricSQL is read-path only and its embedded Postgres (PGlite) does not work in React Native.

For authentication, **Supabase Auth** is the primary recommendation since it is bundled free and integrates directly with RLS policies. **Clerk** ($0 for 50K users) is the premium alternative if polished pre-built auth UI components are desired — its React Native SDK uses native components rather than web views, and setup takes approximately 10 minutes.

---

## Competitive landscape reveals a clear market gap

**No focused breeding-only tracker exists on either app store.** Every competitor is a full farm management suite that includes breeding as one module among many. This creates the core opportunity: a lightweight, laser-focused app for the single workflow of pairing → gestation tracking → birth recording → offspring management.

**FarmKeep** is the closest competitor and the benchmark to beat. At $95.99/year ($9.99/month), it offers breeding management with gestation calculators for 1,200+ breeds, pedigree charts, and pregnancy tracking alongside animal profiles, farm accounting, task management, and land mapping. It has a beautiful modern UI and strong reviews. Its weakness is breadth — small breeders who only want breeding tracking are paying for features they never use.

**Herdwatch**, the #1 livestock app in Ireland/UK with 20,000+ farms, charges ~€79/year and focuses on regulatory compliance (Bord Bia, DEFRA integration). Its breeding section is described as "confusing" by users, it requires separate subscriptions for cattle and sheep modules, and it **does not support goats at all**.

The goat-specific niche is particularly underserved. **My Goat Manager** offers good breeding features with a free tier (25 goats) but has a smaller user base. **Goat Tracker** launched in 2025 as iOS-only with very limited features. **EasyKeeper** is web-only at $209–297/year. **CattleMax** is cattle-only and web-only at $144–660/year.

Common user complaints across all competitors reveal what to build better:

- Breeding sections are "confusing" and buried inside complex farm management UIs
- Web-only apps fail without connectivity (CattleMax, EasyKeeper, Breedr)
- Photo support is missing or poor (HerdBoss users specifically request it)
- Subscription costs accumulate when managing multiple species (Herdwatch)
- Visual pedigree/lineage tools are weak across the board
- Data export for show prep and 4-H/FFA records is frequently requested

**The addressable market is substantial.** USDA data shows **2.51 million goats** across an estimated **100,000+ operations** in the US, with most being small-scale hobby farms. Over 800,000 US farms generate less than $10,000 in annual sales, and 50%+ of farm operators earn their primary income off-farm. The farm management software market is projected to reach **$10.58 billion by 2030** (CAGR 17.3%), with small farms under 100 hectares as the fastest-growing adoption segment at 8.6% CAGR. The hobby farming and homesteading movement continues to accelerate.

---

## Feature prioritization across three release phases

**MVP (3–4 weeks)** focuses on replacing the generic "Event Countdown" app the client currently uses. Core breeding tracking with goat-specific gestation calculation, a clean list view with sorting, and local-only storage. No authentication, no cloud sync, no monetization. This validates the UX and core value proposition.

**v1.0 (additional 8–12 weeks)** adds everything needed for a commercial launch on both app stores. Multi-species support with configurable gestation lengths. Photo uploads and generic icon selection. Notes, confirmed pregnancy checkbox with visual indicator, color customization per entry. Birth logging with offspring count by gender. Cloud sync via PowerSync + Supabase for paid users. Authentication via Supabase Auth. RevenueCat for free/paid tier management. Push notification reminders for upcoming due dates.

**v2.0 (additional 4–6 weeks)** builds competitive moats. CSV/PDF data export for show records and 4-H projects. Breeding history analytics with fertility rate tracking. Visual pedigree/lineage charts. Multi-device sync. Advanced reporting. Potential web companion dashboard.

### Free versus paid feature breakdown

| Feature | Free | Paid ($9.99/year) |
|---|---|---|
| Animals tracked | Up to **10** | Unlimited |
| Species | 1 (goats) | All supported species |
| Breeding records | ✅ Full tracking | ✅ Full tracking |
| Due date calculation | ✅ | ✅ |
| Birth logging | View only | ✅ Full with details |
| Photo uploads | ❌ | ✅ |
| Cloud sync/backup | ❌ Local only | ✅ Cross-device sync |
| Data export | ❌ | ✅ CSV/PDF |
| Color customization | ❌ Default only | ✅ |
| Notifications | 1 active | ✅ Unlimited |
| Breeding analytics | ❌ | ✅ |

The 10-animal free limit provides enough capacity for hobbyists to experience genuine value while creating natural upgrade pressure for anyone with a real breeding operation. The local-only storage constraint for free users means zero marginal infrastructure cost per free user.

---

## Monetization strategy optimized for agricultural users

**$9.99/year** is the recommended primary price point, dramatically undercutting FarmKeep ($95.99/year), Herdwatch (~$79/year), and EasyKeeper ($209/year) while remaining above the "too cheap to trust" threshold. At this price, farmers perceive the cost as less than $1/month — trivial compared to feed costs. The pricing structure should include three tiers: **$1.99/month** (lower commitment barrier), **$9.99/year** (primary, marketed as "Save 58%"), and **$24.99 lifetime** (appeals to subscription-fatigued agricultural users).

**RevenueCat** handles all in-app purchase complexity for free until the app generates $2,500/month in tracked revenue — approximately 300 annual subscribers. It wraps Apple StoreKit and Google Play Billing into a unified SDK, provides analytics dashboards, A/B price testing, and remote paywall configuration. At $9.99/year with the Apple/Google **Small Business Program** (15% commission for developers under $1M revenue), net revenue per subscriber is approximately **$8.49**.

A **7-day free trial** of all premium features upon first install is recommended. RevenueCat data shows 78% of users start a trial in the first week with a hard paywall. After trial expiration, the app gracefully degrades to the free tier without locking users out of existing data.

---

## Testing strategy and security posture

The testing pyramid follows a **70/20/10 split**: 70% unit tests, 20% component/integration tests, 10% E2E tests.

**Unit testing** uses Jest with the `jest-expo` preset and React Native Testing Library. Critical business logic — gestation date calculations, species-specific defaults, sorting algorithms, days-bred counters — targets **90%+ coverage**. The overall codebase targets 70–80%.

**E2E testing uses Maestro over Detox.** Maestro offers zero-config setup, YAML-based declarative test flows readable by non-developers, and official Expo/EAS Workflows integration with a built-in `maestro` job type. Detox, while purpose-built for React Native, has known stability issues (one fintech team reported only 2/10 successful launches on physical devices in September 2025) and requires complex native build configuration. Maestro flows for this app would cover: adding a breeding entry, verifying due date calculation, confirming pregnancy, logging a birth, and testing the sort functionality.

**Linting** uses `eslint-config-expo` (Flat config format for SDK 53+) with `@typescript-eslint`, `eslint-plugin-prettier`, and `eslint-plugin-unused-imports`. Pre-commit hooks via `husky` + `lint-staged` enforce standards before code enters the repository.

### Security aligned with OWASP Mobile Top 10 (2024 edition)

The breeding tracker handles personally identifiable farm data and photos, requiring deliberate security measures:

- **Credential storage**: All auth tokens and API keys stored exclusively in `expo-secure-store` (iOS Keychain / Android Keystore with AES-256 encryption), never in AsyncStorage
- **API key protection**: Supabase and service keys injected via EAS Build Secrets at build time, never committed to version control
- **Data encryption at rest**: expo-sqlite supports SQLCipher for encrypted local databases; Supabase encrypts cloud data at rest by default
- **Network security**: All connections over HTTPS/TLS; `cleartextTrafficPermitted="false"` enforced on Android
- **Authorization**: Supabase Row Level Security policies ensure users can only access their own breeding records at the database level
- **Input validation**: Zod schemas validate all user input client-side; Supabase parameterized queries prevent SQL injection server-side
- **Binary protection**: Hermes bytecode compilation (default in Expo) plus ProGuard/R8 on Android production builds
- **Biometric option**: `expo-local-authentication` enables fingerprint/Face ID for app access
- **Photo security**: Authenticated Supabase Storage URLs; local photos referenced via encrypted file paths

---

## App store roadmap and legal requirements

**Apple App Store** requires a $99/year Developer Program membership. The breeding tracker falls under standard Productivity/Business category guidelines with no specific restrictions for agricultural apps. All premium features **must** use Apple In-App Purchase (StoreKit) — Stripe is only permitted for external web checkout links in the US post-April 2025. A "Restore Purchases" button must be visible. Account deletion capability is mandatory if the app creates user accounts. Privacy labels must declare photo collection, breeding record storage, and notification usage.

**Google Play Store** requires a $25 one-time developer fee. The Data Safety Form must declare all collected data types, encryption status, and deletion capability. Privacy policy must be hosted on a publicly accessible, non-geofenced URL.

**Both stores require a privacy policy** covering: camera/photo library access purpose ("Take photos of your animals for identification"), push notification content types, breeding record data storage and retention, and user rights (access, deletion, export). If available internationally, GDPR compliance requires granular consent, data portability in machine-readable format, 72-hour breach notification, and right to be forgotten. A Terms of Service/EULA covering subscription terms, cancellation policy, and data ownership is also needed.

**Submission timeline**: TestFlight beta builds are available to 100 internal testers immediately, with external beta (up to 10,000 testers) requiring a ~24–48 hour Beta App Review. Production App Store review takes ~24 hours for 90% of submissions. Google Play internal testing tracks require no review and are available within minutes.

---

## Development timeline and cost breakdown

Using Claude Code as the primary development tool with a solo developer:

| Phase | Duration | Hours | Deliverable |
|---|---|---|---|
| MVP | 3–4 weeks | 60–80 | Core breeding tracker, local storage, goats only |
| MVP Testing | 1 week | 15–20 | Jest unit tests + 3 Maestro E2E flows |
| v1.0 Alpha | 6–8 weeks | 120–160 | Multi-species, photos, cloud sync, auth |
| v1.0 Beta | 2–3 weeks | 40–60 | RevenueCat integration, polish, bug fixes |
| App Store Prep | 1–2 weeks | 15–25 | Screenshots, listings, review submission |
| **Total to v1.0 launch** | **~13–18 weeks** | **~250–345** | **Production app on both stores** |
| v2.0 | 4–6 weeks | 80–120 | Notifications, export, analytics |

Without Claude Code, these estimates would be roughly 2–3× longer. The most technically complex components are **offline-first sync with conflict resolution** (PowerSync integration), **in-app purchase testing** across Apple and Google sandboxes, and **cross-platform photo management** with proper permissions handling.

### First-year infrastructure costs

| Item | Annual Cost |
|---|---|
| Apple Developer Program | $99 |
| Google Play Developer | $25 (one-time) |
| Supabase Pro | $300 ($25/month) |
| PowerSync Pro | $588 ($49/month) |
| EAS Build (Starter) | $228 ($19/month) |
| RevenueCat | $0 (free under $2,500 MTR) |
| Domain + hosting | ~$50 |
| Claude Code / AI tools | ~$240–1,200 |
| **Total (recommended)** | **$1,530–2,490** |
| **Total (free tiers only, MVP)** | **$375–500** |

Starting with free tiers for Supabase, PowerSync, and EAS Build reduces first-year costs to under $500, though free tier inactivity pauses (7 days for both Supabase and PowerSync) make paid plans necessary before production launch.

---

## Conclusion: a focused tool in a fragmented market

The strongest insight from this analysis is that **the breeding-only focus is the product's primary competitive advantage, not a limitation**. Every existing competitor has chosen breadth — full farm management with breeding bolted on — creating UX complexity that small-scale breeders consistently complain about. A tool that does one thing exceptionally well, works offline in barns, and costs $9.99/year positions itself in a gap that FarmKeep, Herdwatch, and CattleMax have deliberately chosen not to fill.

The React Native + Expo + Supabase + PowerSync stack is not merely adequate — it is specifically optimized for this use case. Claude Code's TypeScript LSP integration accelerates React Native development by an estimated 2–3×. PowerSync solves the rural connectivity problem that eliminates PWA and weakens Capacitor approaches. react-native-reusables delivers the shadcn aesthetic the client wants. And the free-tier architecture of local-only SQLite means scaling to thousands of free users costs nothing.

The path to market is clear: ship the goat-focused MVP in a month, validate with the homesteader community, expand to multi-species v1.0 in four months, and own the "breeding tracker" category that no one else is specifically targeting.