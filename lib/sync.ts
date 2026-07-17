import {
  PowerSyncDatabase,
  UpdateType,
  type AbstractPowerSyncDatabase,
  type CrudEntry,
  type PowerSyncBackendConnector,
  type PowerSyncCredentials,
  type SyncStatus,
} from '@powersync/react-native';
import { useEffect, useState } from 'react';

import { AppSchema } from '@/db/powersync-schema';

// PowerSync client layer (paid tier only). Never auto-initializes: initSync is
// called explicitly by the app once canSyncToCloud(tier) && isAuthenticated
// (wired in Phase 7B). Free-tier users never construct a PowerSyncDatabase.

// Distinct from the drizzle/expo-sqlite database (also 'freshen.db' in db/client.ts)
// — same-named files in one sandbox invite confusion even across storage dirs.
const POWERSYNC_DB_FILENAME = 'freshen-sync.db';
const CLERK_POWERSYNC_TEMPLATE = 'powersync';

/** Clerk's getToken, narrowed to the JWT-template call this layer makes. */
export type GetToken = (opts: { template: string }) => Promise<string | null>;

export type SyncStatusValue = 'synced' | 'syncing' | 'offline';

/** The tables this app syncs. Matches the backend upload contract table enum. */
export type SyncTable = 'breeding_records' | 'births';

/** One entry in the POST /api/sync/upload request body (backend-stack-decision.md). */
export type SyncOperation =
  | { op: 'PUT'; table: SyncTable; id: string; data: Record<string, unknown> }
  | { op: 'PATCH'; table: SyncTable; id: string; data: Record<string, unknown> }
  | { op: 'DELETE'; table: SyncTable; id: string };

const SYNC_TABLES: readonly SyncTable[] = ['breeding_records', 'births'];

function toSyncTable(table: string): SyncTable {
  if ((SYNC_TABLES as readonly string[]).includes(table)) {
    return table as SyncTable;
  }
  throw new Error(`Cannot sync unknown table "${table}"`);
}

/**
 * Pure mapping from a PowerSync CRUD batch to the backend upload contract. Exported
 * (SDK-free) so it is unit-testable without the native module. DELETE carries no
 * data; PUT/PATCH carry the changed columns from opData (empty object if absent).
 * An unrecognized table throws so a bad write never reaches the endpoint silently.
 */
export function mapCrudBatchToOperations(entries: CrudEntry[]): SyncOperation[] {
  return entries.map((entry) => {
    const table = toSyncTable(entry.table);

    if (entry.op === UpdateType.DELETE) {
      return { op: 'DELETE', table, id: entry.id };
    }

    const op = entry.op === UpdateType.PUT ? 'PUT' : 'PATCH';
    return { op, table, id: entry.id, data: entry.opData ?? {} };
  });
}

/**
 * Collapses PowerSync's SyncStatus onto the three states the UI renders:
 *   - offline: not connected and not attempting to connect
 *   - syncing: connecting, or connected with an active upload/download
 *   - synced:  connected and idle
 */
export function deriveSyncStatus(status: SyncStatus): SyncStatusValue {
  if (!status.connected) {
    return status.connecting ? 'syncing' : 'offline';
  }
  const { uploading, downloading } = status.dataFlowStatus;
  return uploading || downloading ? 'syncing' : 'synced';
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set — cloud sync cannot be initialized`);
  }
  return value;
}

/**
 * Connector bridging PowerSync to Clerk auth and the Vercel upload endpoint.
 * fetchCredentials points the sync stream at the PowerSync service with a fresh
 * Clerk JWT; uploadData drains the local CRUD queue to POST /api/sync/upload and
 * only completes the batch on a 200 — any other outcome throws so PowerSync retries.
 */
class FreshenSyncConnector implements PowerSyncBackendConnector {
  constructor(
    private readonly endpoint: string,
    private readonly backendUrl: string,
    private readonly getToken: GetToken,
  ) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const token = await this.getToken({ template: CLERK_POWERSYNC_TEMPLATE });
    if (!token) return null;
    return { endpoint: this.endpoint, token };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const batch = await database.getCrudBatch();
    if (!batch) return;

    const token = await this.getToken({ template: CLERK_POWERSYNC_TEMPLATE });
    if (!token) {
      throw new Error('No auth token available for sync upload');
    }

    const response = await fetch(`${this.backendUrl}/api/sync/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ operations: mapCrudBatchToOperations(batch.crud) }),
    });

    if (!response.ok) {
      // Leave the batch in the local queue; throwing triggers PowerSync's retry.
      throw new Error(`Sync upload failed (${response.status})`);
    }

    await batch.complete();
  }
}

let db: PowerSyncDatabase | null = null;

/** The active PowerSync database, or null when sync is not initialized. */
export function getSyncDatabase(): PowerSyncDatabase | null {
  return db;
}

/**
 * Construct the PowerSync database and connect it to the backend. Idempotent: a
 * second call while already initialized is a no-op. Throws if the sync env vars are
 * missing so callers can gate on configuration.
 */
export async function initSync(getToken: GetToken): Promise<void> {
  const endpoint = requireEnv('EXPO_PUBLIC_POWERSYNC_URL', process.env.EXPO_PUBLIC_POWERSYNC_URL);
  const backendUrl = requireEnv('EXPO_PUBLIC_BACKEND_URL', process.env.EXPO_PUBLIC_BACKEND_URL);

  if (db) return;

  db = new PowerSyncDatabase({
    schema: AppSchema,
    database: { dbFilename: POWERSYNC_DB_FILENAME },
  });

  // init() surfaces initialization errors before we attempt to connect.
  await db.init();
  await db.connect(new FreshenSyncConnector(endpoint, backendUrl, getToken));
}

/** Disconnect and close the PowerSync database. Safe to call when not initialized. */
export async function teardownSync(): Promise<void> {
  if (!db) return;
  const closing = db;
  db = null;
  await closing.disconnect();
  await closing.close();
}

/**
 * Subscribe to the PowerSync sync status, collapsed to the three UI states. Returns
 * 'offline' when sync is not initialized (free tier / signed out).
 */
export function useSyncStatus(): SyncStatusValue {
  const [value, setValue] = useState<SyncStatusValue>(() =>
    db ? deriveSyncStatus(db.currentStatus) : 'offline',
  );

  useEffect(() => {
    if (!db) {
      setValue('offline');
      return;
    }
    setValue(deriveSyncStatus(db.currentStatus));
    const unsubscribe = db.registerListener({
      statusChanged: (status) => setValue(deriveSyncStatus(status)),
    });
    return unsubscribe;
  }, []);

  return value;
}
