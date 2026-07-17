import { describe, expect, it, vi } from 'vitest';
import type { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema.js';
import { applyBatch, uploadBatchSchema, type UploadOperation } from '../lib/syncUpload.js';

// Record every column/value pair passed to `eq(...)` so we can assert the WHERE
// clauses scope to the authenticated user.
const { eqCalls } = vi.hoisted(() => ({ eqCalls: [] as [unknown, unknown][] }));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: (column: unknown, value: unknown) => {
      eqCalls.push([column, value]);
      return actual.eq(column as never, value as never);
    },
  };
});

const AUTH_USER = 'user_authenticated';

interface InsertCall {
  table: unknown;
  values: Record<string, unknown>;
  set: Record<string, unknown>;
  setWhere?: unknown;
}
interface UpdateCall {
  table: unknown;
  set: Record<string, unknown>;
}
interface DeleteCall {
  table: unknown;
}

function createMockDb() {
  const captured = {
    insert: [] as InsertCall[],
    update: [] as UpdateCall[],
    delete: [] as DeleteCall[],
  };

  const tx = {
    insert(table: unknown) {
      const call: InsertCall = { table, values: {}, set: {} };
      return {
        values(values: Record<string, unknown>) {
          call.values = values;
          return {
            onConflictDoUpdate(config: { set: Record<string, unknown>; setWhere?: unknown }) {
              call.set = config.set;
              call.setWhere = config.setWhere;
              captured.insert.push(call);
              return Promise.resolve();
            },
          };
        },
      };
    },
    update(table: unknown) {
      const call: UpdateCall = { table, set: {} };
      return {
        set(set: Record<string, unknown>) {
          call.set = set;
          return {
            where() {
              captured.update.push(call);
              return Promise.resolve();
            },
          };
        },
      };
    },
    delete(table: unknown) {
      const call: DeleteCall = { table };
      return {
        where() {
          captured.delete.push(call);
          return Promise.resolve();
        },
      };
    },
  };

  const db = {
    transaction(fn: (t: typeof tx) => Promise<unknown>) {
      return fn(tx);
    },
  } as unknown as NeonDatabase<typeof schema>;

  return { db, captured };
}

function run(operations: UploadOperation[]) {
  const { db, captured } = createMockDb();
  return applyBatch(db, AUTH_USER, operations).then(() => captured);
}

describe('uploadBatchSchema', () => {
  it('accepts a valid batch of PUT / PATCH / DELETE operations', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [
        { op: 'PUT', table: 'breeding_records', id: 'r1', data: { animalName: 'Bess' } },
        { op: 'PATCH', table: 'births', id: 'b1', data: { notes: 'note' } },
        { op: 'DELETE', table: 'breeding_records', id: 'r2' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty operations array', () => {
    expect(uploadBatchSchema.safeParse({ operations: [] }).success).toBe(true);
  });

  it('rejects an unknown table name', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [{ op: 'PUT', table: 'animals', id: 'r1', data: {} }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an operation missing an id', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [{ op: 'PUT', table: 'breeding_records', data: {} }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an empty id', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [{ op: 'DELETE', table: 'births', id: '' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a PUT operation without a data payload', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [{ op: 'PUT', table: 'breeding_records', id: 'r1' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown op verb', () => {
    const result = uploadBatchSchema.safeParse({
      operations: [{ op: 'INSERT', table: 'breeding_records', id: 'r1', data: {} }],
    });
    expect(result.success).toBe(false);
  });
});

describe('applyBatch', () => {
  it('upserts a PUT and forces user_id to the authenticated user', async () => {
    const captured = await run([
      { op: 'PUT', table: 'breeding_records', id: 'r1', data: { animalName: 'Bess' } },
    ]);

    expect(captured.insert).toHaveLength(1);
    const call = captured.insert[0]!;
    expect(call.table).toBe(schema.breedingRecords);
    expect(call.values).toMatchObject({ id: 'r1', animalName: 'Bess', userId: AUTH_USER });
    expect(call.set).toMatchObject({ animalName: 'Bess', userId: AUTH_USER });
  });

  it('guards the PUT conflict path so a colliding id owned by another user is not overwritten', async () => {
    eqCalls.length = 0;
    const captured = await run([
      { op: 'PUT', table: 'breeding_records', id: 'r1', data: { animalName: 'Bess' } },
    ]);

    expect(captured.insert[0]!.setWhere).toBeDefined();
    expect(
      eqCalls.some(
        ([column, value]) => column === schema.breedingRecords.userId && value === AUTH_USER,
      ),
    ).toBe(true);
  });

  it('ignores a client-supplied user_id on PUT and overwrites it with the JWT sub', async () => {
    const captured = await run([
      {
        op: 'PUT',
        table: 'breeding_records',
        id: 'r1',
        data: { animalName: 'Bess', user_id: 'attacker', userId: 'attacker' },
      },
    ]);

    const call = captured.insert[0]!;
    expect(call.values.userId).toBe(AUTH_USER);
    expect(call.values.user_id).toBeUndefined();
    expect(call.set.userId).toBe(AUTH_USER);
    expect(call.set.user_id).toBeUndefined();
  });

  it('applies a PATCH as a scoped update and strips a client-supplied user_id', async () => {
    const captured = await run([
      { op: 'PATCH', table: 'births', id: 'b1', data: { notes: 'update', user_id: 'attacker' } },
    ]);

    expect(captured.update).toHaveLength(1);
    const call = captured.update[0]!;
    expect(call.table).toBe(schema.births);
    expect(call.set).toMatchObject({ notes: 'update' });
    expect(call.set.user_id).toBeUndefined();
    expect(call.set.userId).toBeUndefined();
    // WHERE clause must scope to the births owner column and the authenticated user.
    expect(eqCalls).toContainEqual([schema.births.userId, AUTH_USER]);
  });

  it('applies a DELETE scoped to the authenticated user on the correct table', async () => {
    const captured = await run([{ op: 'DELETE', table: 'breeding_records', id: 'r2' }]);

    expect(captured.delete).toHaveLength(1);
    expect(captured.delete[0]!.table).toBe(schema.breedingRecords);
    expect(eqCalls).toContainEqual([schema.breedingRecords.id, 'r2']);
    expect(eqCalls).toContainEqual([schema.breedingRecords.userId, AUTH_USER]);
  });

  it('routes operations to the correct table by name', async () => {
    const captured = await run([{ op: 'PUT', table: 'births', id: 'b1', data: { doesCount: 2 } }]);
    expect(captured.insert[0]!.table).toBe(schema.births);
  });

  it('processes every operation in a mixed batch', async () => {
    const captured = await run([
      { op: 'PUT', table: 'breeding_records', id: 'r1', data: { animalName: 'A' } },
      { op: 'PATCH', table: 'breeding_records', id: 'r1', data: { notes: 'x' } },
      { op: 'DELETE', table: 'births', id: 'b9' },
    ]);

    expect(captured.insert).toHaveLength(1);
    expect(captured.update).toHaveLength(1);
    expect(captured.delete).toHaveLength(1);
  });

  it('preserves non-ownership data fields on upsert', async () => {
    const captured = await run([
      {
        op: 'PUT',
        table: 'breeding_records',
        id: 'r1',
        data: { animalName: 'Bess', species: 'goat', gestationDays: 150 },
      },
    ]);
    expect(captured.insert[0]!.values).toMatchObject({
      animalName: 'Bess',
      species: 'goat',
      gestationDays: 150,
    });
  });
});
