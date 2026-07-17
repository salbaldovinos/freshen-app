# Phase 7.0 — External Account Setup (click-by-click)

Everything here is on free tiers. No Apple/Google developer accounts needed yet — those are Phase 10 (real in-app purchases can't be tested until then; RevenueCat is set up now so the code can be wired).

**Do the steps in this order** — each one produces a value the next needs. Steps marked **[YOU]** need a human in a browser; steps marked **[AGENT]** can be done in a Claude Code session once you paste in the values.

**Collect values into `backend/.env` and `.env` as you go** (both are gitignored — never commit them). Templates at the bottom.

---

## 1. Clerk — application + keys [DONE 2026-07-17]

Completed via `clerk init`: app `Freshen` (`app_3GeBlreHlRJUN2oUi3chkQYhT3h`), publishable key in `.env`, secret key in `backend/.env`. Remaining Clerk work is step 6 (JWT template) plus one check: **Dashboard → Native applications → confirm the Native API is enabled.** Original steps kept for reference:

1. Go to https://clerk.com → sign up (GitHub login is fine) → **Create application**.
2. Name: `Freshen`. Sign-in options: enable **Email** only (leave Google/Apple off for v1).
3. After creation, open **Configure → Email, phone, username**: confirm **Email address** is required and **Email verification code** is the verification method (this is the default).
4. Open **Configure → API keys**:
   - Copy **Publishable key** (`pk_test_…`) → this is `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
   - Copy **Secret key** (`sk_test_…`) → this is `CLERK_SECRET_KEY` (backend only — never in the app).
   - Note your **Frontend API URL** (looks like `https://xxxxx-xx.clerk.accounts.dev`). Your **JWKS URL** is that plus `/.well-known/jwks.json` — PowerSync needs it in step 5.

Stop here on Clerk for now — the JWT template (step 6) needs the PowerSync instance URL first.

## 2. Vercel — backend project + Neon + Blob [YOU]

1. Go to https://vercel.com → log in → **Add New → Project** → import `salbaldovinos/freshen-app` from GitHub.
2. Project name: `freshen-backend`. **Root Directory: click Edit and set it to `backend`** (this is the important one). Framework preset: **Other**. Deploy (the first deploy may error until env vars exist — fine).
3. **Neon Postgres:** In the project → **Storage** tab → **Create Database** → **Neon (Postgres)** → accept defaults → **Connect** it to `freshen-backend`. This auto-adds `DATABASE_URL` to the project's env vars. Copy `DATABASE_URL` for yourself too (Storage → your database → `.env.local` snippet).
4. **Enable logical replication (required by PowerSync):** From the Neon database page click **Open in Neon Console** → **Project settings → Logical Replication** (sometimes under "Beta") → **Enable**. This restarts the Neon compute; takes a minute.
5. **Blob storage:** back in Vercel → **Storage → Create Database → Blob** → connect to `freshen-backend`. This auto-adds `BLOB_READ_WRITE_TOKEN`.
6. **Webhook secret:** run `openssl rand -hex 32` in any terminal (or use a password generator). In Vercel → `freshen-backend` → **Settings → Environment Variables**, add `REVENUECAT_WEBHOOK_AUTH` = that string. Add `CLERK_SECRET_KEY` = the `sk_test_…` from step 1 while you're there.

## 3. Push the database schema to Neon [AGENT]

Paste the `DATABASE_URL` into `backend/.env`, then in a Claude Code session:

```bash
cd backend && DATABASE_URL="postgres://…" npx drizzle-kit push
```

Creates `users`, `breeding_records`, `births` in Neon. (I can run this and verify the tables — just tell me the env file is in place.)

## 4. PowerSync — instance connected to Neon [YOU]

1. Go to https://www.powersync.com → **Start free** → sign up → create a project → **Create instance** (name: `freshen`, pick the region closest to you).
2. **Connect the database:** when prompted for connection details, paste the Neon `DATABASE_URL` (or fill host/database/user/password from it). SSL mode: `verify-full` — PowerSync bundles Neon's CA, no cert upload needed. Test connection → save.
3. Copy the **Instance URL** (looks like `https://xxxxxxxx.powersync.journeyapps.com`) → this is `EXPO_PUBLIC_POWERSYNC_URL`, and Clerk needs it in step 6.
4. **Sync rules:** open the instance's `sync-rules.yaml` editor and paste:

```yaml
bucket_definitions:
  user_data:
    parameters: SELECT request.user_id() as user_id
    data:
      - SELECT * FROM breeding_records WHERE user_id = bucket.user_id
      - SELECT * FROM births WHERE user_id = bucket.user_id
```

   Deploy the sync rules (validation will fail if step 3's schema push hasn't run yet).

## 5. PowerSync ← Clerk auth wiring [YOU]

In the PowerSync dashboard: instance → **Client Auth** (or Settings → Auth): add the **JWKS URI** from step 1 (`https://xxxxx-xx.clerk.accounts.dev/.well-known/jwks.json`). Save/redeploy.

## 6. Clerk JWT template for PowerSync [YOU]

1. Back in Clerk: **Configure → JWT templates → New template → Blank**.
2. Name: exactly `powersync` (the app requests `getToken({ template: 'powersync' })`).
3. **Token lifetime:** `3600` seconds (PowerSync rejects tokens valid longer than 60 min).
4. **Claims:** paste, substituting your instance URL from step 4:

```json
{ "aud": "https://xxxxxxxx.powersync.journeyapps.com" }
```

5. Save.

## 7. RevenueCat — project + entitlement + webhook [YOU]

1. Go to https://app.revenuecat.com → sign up → **Create new project** → name `Freshen`.
2. **Add apps:** Project settings → **Apps** → add **App Store** app (bundle ID `com.freshenapp.freshen`) and **Play Store** app (package `com.freshenapp.freshen`). Skip store credentials for now — they become available in Phase 10.
3. Copy each app's **Public API key** (`appl_…` and `goog_…`) → `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
4. **Entitlement:** Project → **Entitlements** → new entitlement, identifier exactly `pro`.
5. Products/offerings (annual w/ 7-day trial, monthly, lifetime) need App Store Connect / Play Console products first — deferred to Phase 10; the paywall code reads offerings dynamically, so nothing blocks Phase 7.
6. **Webhook:** Project → **Integrations → Webhooks** → add webhook. URL: `https://<your-freshen-backend-domain>.vercel.app/api/webhooks/revenuecat` (the domain is on the Vercel project overview). **Authorization header value:** the `REVENUECAT_WEBHOOK_AUTH` string from step 2.6.

## 8. PostHog — project + key [YOU]

1. Go to https://us.posthog.com/signup → sign up → create project `Freshen`.
2. **Settings → Project → Project API key** (`phc_…`) → `EXPO_PUBLIC_POSTHOG_API_KEY`. The host for US cloud is `https://us.i.posthog.com` (the SDK default; only needed if you chose EU).

## 9. Env file templates

`.env` (repo root — the Expo app):

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_…
EXPO_PUBLIC_POWERSYNC_URL=https://xxxxxxxx.powersync.journeyapps.com
EXPO_PUBLIC_BACKEND_URL=https://freshen-backend-xxxx.vercel.app
EXPO_PUBLIC_POSTHOG_API_KEY=phc_…
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_…
```

`backend/.env` (local dev only — production values live in Vercel env vars, set in step 2):

```bash
CLERK_SECRET_KEY=sk_test_…
DATABASE_URL=postgres://…
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_…
REVENUECAT_WEBHOOK_AUTH=<random hex from step 2.6>
```

## 10. Hand back to the agent [AGENT]

Once both env files exist, a Claude Code session can finish without you: push the Neon schema (step 3 if not done), redeploy `freshen-backend`, smoke-test the endpoints (401 without token / 200 with), and launch the six Phase 7A agents.

**Checklist of values you should end up with:** `pk_test_…`, `sk_test_…`, Clerk JWKS URL, Neon `DATABASE_URL` (+ logical replication ON), `BLOB_READ_WRITE_TOKEN`, webhook auth string, PowerSync instance URL (+ sync rules deployed + JWKS configured), Clerk `powersync` JWT template, RevenueCat `appl_…`/`goog_…` keys + `pro` entitlement + webhook, PostHog `phc_…` key.
