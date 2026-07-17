# freshen-backend

Vercel backend for the Freshen livestock breeding tracker. Provides Clerk-authenticated
sync writes, the RevenueCat entitlement webhook, account deletion, and Vercel Blob photo
upload tokens. Neon Postgres is the cloud source of truth (and the PowerSync replication
source). This package is standalone — it is not part of the Expo app's dependency tree.

See `../_dev/backend-stack-decision.md` for the architecture and API contracts.

## Endpoints

| Method + path                  | Auth                              | Purpose                                                    |
| ------------------------------ | --------------------------------- | ---------------------------------------------------------- |
| `POST /api/sync/upload`        | Clerk JWT (Bearer)                | Apply a CRUD batch to Neon, scoped to the JWT `sub`.       |
| `POST /api/webhooks/revenuecat`| `Authorization` == shared secret  | Update `users.tier` from purchase/expiration events.       |
| `POST /api/account/delete`     | Clerk JWT (Bearer)                | Delete Blob photos, Neon rows, and the Clerk user.         |
| `POST /api/photos/upload-url`  | Clerk JWT (Bearer)                | Issue a Vercel Blob client-upload token (paid tier).       |

### `POST /api/sync/upload` request body

```json
{
  "operations": [
    { "op": "PUT",    "table": "breeding_records", "id": "<uuid>", "data": { } },
    { "op": "PATCH",  "table": "births",           "id": "<uuid>", "data": { } },
    { "op": "DELETE", "table": "breeding_records", "id": "<uuid>" }
  ]
}
```

Responses: `200 {}` on success, `400` on a malformed batch, `401` on an invalid/expired token.
Every write is forced to `user_id = <JWT sub>`; any client-supplied user id is ignored.

## Environment variables

| Variable                  | Used by                                    | Notes                                                        |
| ------------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| `CLERK_SECRET_KEY`        | `lib/auth.ts`, `api/account/delete.ts`     | Clerk backend secret; verifies JWTs and deletes users.      |
| `DATABASE_URL`            | all Neon writes, `drizzle.config.ts`       | Neon Postgres connection string (pooled).                   |
| `BLOB_READ_WRITE_TOKEN`   | `api/photos/upload-url.ts`, account delete | Vercel Blob read/write token.                               |
| `REVENUECAT_WEBHOOK_AUTH` | `api/webhooks/revenuecat.ts`               | Shared secret matched against the request `Authorization`.  |

Set these in the Vercel project (Settings → Environment Variables). Do not commit `.env` files.

## Local development

```bash
npm install          # standalone package — plain npm, no --legacy-peer-deps
npm run typecheck    # tsc --noEmit
npm test             # vitest run
```

## Database schema (Neon)

Drizzle Postgres schema lives in `db/schema.ts`: `users`, `breeding_records`, `births`.
Column names mirror the mobile SQLite schema (`../db/schema.ts`) with a `user_id` owner
column added to both record tables.

Push the schema to Neon (uses `DATABASE_URL`):

```bash
DATABASE_URL='postgres://…' npx drizzle-kit push
```

After the first push, enable **logical replication** in the Neon dashboard
(Settings → Logical replication) so PowerSync can use Neon as a replication source.

## Deploy

```bash
vercel link          # link this directory to the `freshen-backend` Vercel project
vercel deploy        # preview deploy
vercel deploy --prod # production deploy
```

Configure the four environment variables above in the Vercel project before deploying.
Point the RevenueCat webhook at `https://<deployment>/api/webhooks/revenuecat` with the
`Authorization` header set to `REVENUECAT_WEBHOOK_AUTH`.
