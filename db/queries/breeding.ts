import { eq, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { breedingRecords, type BreedingRecord, type NewBreedingRecord } from '@/db/schema';

/**
 * Fetch all breeding records.
 * Due date is NOT computed here — the store/UI layer handles that.
 */
export async function getAllBreedingRecords(): Promise<BreedingRecord[]> {
  return db.select().from(breedingRecords);
}

/**
 * Fetch a single breeding record by ID.
 */
export async function getBreedingRecordById(id: string): Promise<BreedingRecord | undefined> {
  const results = await db.select().from(breedingRecords).where(eq(breedingRecords.id, id));
  return results[0];
}

/**
 * Insert a new breeding record with generated UUID and timestamps.
 */
export async function createBreedingRecord(
  data: Omit<NewBreedingRecord, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<BreedingRecord> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const results = await db
    .insert(breedingRecords)
    .values({
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return results[0];
}

/**
 * Update an existing breeding record. Sets updatedAt automatically.
 */
export async function updateBreedingRecord(
  id: string,
  data: Partial<NewBreedingRecord>,
): Promise<BreedingRecord> {
  const now = new Date().toISOString();
  const results = await db
    .update(breedingRecords)
    .set({ ...data, updatedAt: now })
    .where(eq(breedingRecords.id, id))
    .returning();
  return results[0];
}

/**
 * Hard delete a breeding record. Cascade will remove associated births.
 */
export async function deleteBreedingRecord(id: string): Promise<void> {
  await db.delete(breedingRecords).where(eq(breedingRecords.id, id));
}

/**
 * Archive a breeding record (soft delete).
 */
export async function archiveBreedingRecord(id: string): Promise<BreedingRecord> {
  const now = new Date().toISOString();
  const results = await db
    .update(breedingRecords)
    .set({ archived: true, updatedAt: now })
    .where(eq(breedingRecords.id, id))
    .returning();
  return results[0];
}

/**
 * Mark a breeding record as confirmed pregnant.
 */
export async function confirmPregnancy(id: string): Promise<BreedingRecord> {
  const now = new Date().toISOString();
  const results = await db
    .update(breedingRecords)
    .set({ confirmedPregnant: true, updatedAt: now })
    .where(eq(breedingRecords.id, id))
    .returning();
  return results[0];
}

/**
 * Count distinct animal names (case-insensitive) across non-archived records.
 * Used for tier-gating (free tier: max 10 animals).
 */
export function getUniqueAnimalCount(): number {
  const result = db.all<{ count: number }>(
    sql`SELECT COUNT(DISTINCT LOWER(${breedingRecords.animalName})) as count FROM ${breedingRecords} WHERE ${breedingRecords.archived} = 0`,
  );
  return result[0]?.count ?? 0;
}
