import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';

import migrations from './migrations/migrations';
import * as schema from './schema';

const expoDb = openDatabaseSync('freshen.db', { enableChangeListener: true });

export const db = drizzle(expoDb, { schema });

/**
 * React hook that runs Drizzle migrations on first launch.
 * Returns { success, error } state for gating app render.
 */
export function useInitializeDatabase() {
  return useMigrations(db, migrations);
}
