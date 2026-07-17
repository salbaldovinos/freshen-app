# Backend Stack Decision — Clerk + Vercel (replaces Supabase)

**Date:** 2026-07-17
**Status:** Approved
**Supersedes:** Supabase references in PRD v1.2 Features 2.1, 2.3, 2.4 and Phase 7 of the original implementation plan. The PRD remains canonical for UX, copy, validation rules, and acceptance criteria — only the infrastructure provider changes.

## Decision

Replace Supabase (auth + Postgres + storage + edge functions) with:

| Role | Was (Supabase) | Now |
|---|---|---|
| Auth | Supabase Auth | **Clerk** (`@clerk/clerk-expo`) |
| Postgres (PowerSync source) | Supabase Postgres + RLS | **Neon** (via Vercel Marketplace), logical replication |
| Server functions | Edge Functions | **Vercel Functions** (`backend/` directory, same repo) |
| Photo storage | Supabase Storage | **Vercel Blob** |
| Sync writes (client → cloud) | PowerSync Supabase connector (supabase-js + RLS) | **Custom upload endpoint** `POST /api/sync/upload` on Vercel |

RevenueCat, PostHog, expo-notifications, and the local Drizzle + expo-sqlite layer are unaffected.

## Verified compatibility

- PowerSync officially supports Clerk as an auth provider: the PowerSync instance verifies Clerk-issued JWTs against Clerk's public JWKS URL. https://docs.powersync.com/installation/authentication-setup
- PowerSync has a first-class Neon integration (logical replication; Neon CA cert bundled). https://docs.powersync.com/integrations/neon

## Architecture

```
Expo app (RN 0.83)
 ├─ ClerkProvider (@clerk/clerk-expo, token cache in expo-secure-store)
 ├─ PowerSync client (@powersync/react-native)
 │    ├─ fetchCredentials(): Clerk getToken({ template: 'powersync' })
 │    └─ uploadData(): POST /api/sync/upload  (Bearer = Clerk JWT)
 └─ RevenueCat / PostHog / expo-notifications (unchanged)

Vercel (backend/ in this repo, deployed as a Vercel project)
 ├─ POST /api/sync/upload        — verify Clerk JWT, apply CRUD batch to Neon
 ├─ POST /api/webhooks/revenuecat — auth header check, update users.tier in Neon
 ├─ POST /api/account/delete     — delete Clerk user + Neon rows + Blob photos
 ├─ POST /api/photos/upload-url  — issue Vercel Blob signed upload (paid tier)
 └─ Neon Postgres: users, breeding_records, births (Drizzle schema, logical replication ON)

PowerSync Cloud
 ├─ Source: Neon (logical replication)
 ├─ Auth: Clerk JWKS URL (https://<clerk-slug>.clerk.accounts.dev/.well-known/jwks.json)
 └─ Sync rules: bucket per user (user_id = JWT sub)
```

## Rationale

- Clerk's Expo SDK provides email verification, password reset, and session management out of the box — eliminates most hand-rolled work in PRD Feature 2.1.
- Consolidates backend on Vercel (one dashboard/billing surface already in use).
- Cost at launch scale: $0 (Clerk free ≤10k MAU, Neon/Vercel/PowerSync free tiers).
- Trade-off accepted: we write and maintain the sync upload endpoint that the Supabase connector would have provided for free. Security moves from Postgres RLS to (a) JWT verification in the upload endpoint for writes and (b) PowerSync sync rules for reads.

## Key contracts

**Clerk JWT template `powersync`:** `aud` = PowerSync instance URL, lifetime ≤ 60 min (PowerSync requires `exp − iat ≤ 3600`).

**`POST /api/sync/upload`** — request body:

```json
{ "operations": [ { "op": "PUT" | "PATCH" | "DELETE", "table": "breeding_records" | "births", "id": "<uuid>", "data": { } } ] }
```

Responses: `200 {}` on success (client completes the CRUD batch), `401` invalid/expired token, `400` malformed batch. All writes are scoped to the `sub` (user id) of the verified JWT — the endpoint must ignore any client-supplied user id.
