import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { breedingRecords, births } from '../db/schema';

// ---------------------------------------------------------------------------
// Request contract (backend-stack-decision.md):
//   { operations: [ { op: 'PUT'|'PATCH'|'DELETE',
//                     table: 'breeding_records'|'births', id, data? } ] }
// ---------------------------------------------------------------------------

const tableNameSchema = z.enum(['breeding_records', 'births']);
const idSchema = z.string().min(1);
const dataSchema = z.record(z.string(), z.unknown());

const operationSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('PUT'), table: tableNameSchema, id: idSchema, data: dataSchema }),
  z.object({ op: z.literal('PATCH'), table: tableNameSchema, id: idSchema, data: dataSchema }),
  z.object({ op: z.literal('DELETE'), table: tableNameSchema, id: idSchema }),
]);

export const uploadBatchSchema = z.object({
  operations: z.array(operationSchema),
});

export type UploadOperation = z.infer<typeof operationSchema>;
export type UploadBatch = z.infer<typeof uploadBatchSchema>;

type SyncDatabase = NeonDatabase<typeof schema>;

const TABLES = {
  breeding_records: breedingRecords,
  births,
} as const;

/**
 * Remove any client-supplied ownership fields so the caller can never reassign a
 * row to another user. `user_id` is always set from the authenticated JWT.
 */
function stripOwnership(data: Record<string, unknown>): Record<string, unknown> {
  const { userId: _userId, user_id: _user_id, ...rest } = data;
  void _userId;
  void _user_id;
  return rest;
}

/**
 * Apply a validated CRUD batch to Neon inside a single transaction. Every write
 * is scoped to `userId` (the verified JWT `sub`): PUT upserts, PATCH updates the
 * row only when it already belongs to the user, DELETE removes it only when it
 * belongs to the user. Any `user_id` in the payload is ignored.
 */
export async function applyBatch(
  db: SyncDatabase,
  userId: string,
  operations: UploadOperation[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const op of operations) {
      // Runtime table is selected from the validated name; the cast to a single
      // concrete table only gives the compiler one column shape to check against
      // (both tables share `id` and `user_id`). The payload is untyped client
      // JSON, so it is cast at this boundary rather than verified per-column.
      const table = TABLES[op.table] as typeof breedingRecords;

      if (op.op === 'DELETE') {
        await tx.delete(table).where(and(eq(table.id, op.id), eq(table.userId, userId)));
        continue;
      }

      const data = stripOwnership(op.data);

      if (op.op === 'PATCH') {
        await tx
          .update(table)
          .set(data as Partial<typeof breedingRecords.$inferInsert>)
          .where(and(eq(table.id, op.id), eq(table.userId, userId)));
        continue;
      }

      const row = { ...data, id: op.id, userId } as typeof breedingRecords.$inferInsert;
      // setWhere guards the conflict path: colliding with an id owned by a
      // different user must be a no-op, not a cross-tenant overwrite.
      await tx
        .insert(table)
        .values(row)
        .onConflictDoUpdate({
          target: table.id,
          set: { ...data, userId } as Partial<typeof breedingRecords.$inferInsert>,
          setWhere: eq(table.userId, userId),
        });
    }
  });
}
