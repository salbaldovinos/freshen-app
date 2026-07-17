import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { births, type Birth, type NewBirth } from '@/db/schema';

/**
 * Get all births for a breeding record, ordered by birth date descending.
 */
export async function getBirthsByBreedingId(breedingRecordId: string): Promise<Birth[]> {
  return db
    .select()
    .from(births)
    .where(eq(births.breedingRecordId, breedingRecordId))
    .orderBy(desc(births.birthDate));
}

/**
 * Insert a new birth record with generated UUID and timestamp.
 */
export async function createBirth(data: Omit<NewBirth, 'id' | 'createdAt'>): Promise<Birth> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const results = await db
    .insert(births)
    .values({
      ...data,
      id,
      createdAt: now,
    })
    .returning();
  return results[0];
}

/**
 * Check if any birth record exists for a breeding record.
 */
export async function hasAnyBirth(breedingRecordId: string): Promise<boolean> {
  const results = await db
    .select({ id: births.id })
    .from(births)
    .where(eq(births.breedingRecordId, breedingRecordId))
    .limit(1);
  return results.length > 0;
}
