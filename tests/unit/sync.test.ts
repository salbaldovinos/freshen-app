import { UpdateType, type CrudEntry } from '@powersync/react-native';

import { mapCrudBatchToOperations } from '@/lib/sync';

// The SDK pulls in native modules and is exercised elsewhere; mock the whole
// boundary (jest hoists this above the imports above). UpdateType uses the real
// string values from the installed .d.ts so the mapper's enum comparisons behave
// exactly as in production. Schema/Table/column are stubbed so db/powersync-schema.ts
// (imported transitively) loads without the native module.
jest.mock('@powersync/react-native', () => ({
  __esModule: true,
  UpdateType: { PUT: 'PUT', PATCH: 'PATCH', DELETE: 'DELETE' },
  PowerSyncDatabase: class {},
  Schema: class {},
  Table: class {},
  column: { text: { type: 'TEXT' }, integer: { type: 'INTEGER' }, real: { type: 'REAL' } },
}));

// babel-preset-expo rewrites `process.env.EXPO_PUBLIC_*` to an import from
// 'expo/virtual/env'; mirror it so module load resolves under babel-jest.
jest.mock('expo/virtual/env', () => ({ __esModule: true, env: process.env }));

function crud(op: string, table: string, id: string, opData?: Record<string, unknown>): CrudEntry {
  return { op, table, id, opData, clientId: 1, transactionId: 1 } as unknown as CrudEntry;
}

describe('mapCrudBatchToOperations', () => {
  it('maps a PUT to an operation carrying the full row data', () => {
    const entries = [
      crud(UpdateType.PUT, 'breeding_records', 'rec-1', {
        animal_name: 'Daisy',
        gestation_days: 150,
        confirmed_pregnant: 0,
      }),
    ];

    expect(mapCrudBatchToOperations(entries)).toEqual([
      {
        op: 'PUT',
        table: 'breeding_records',
        id: 'rec-1',
        data: { animal_name: 'Daisy', gestation_days: 150, confirmed_pregnant: 0 },
      },
    ]);
  });

  it('maps a PATCH carrying only the changed columns', () => {
    const entries = [
      crud(UpdateType.PATCH, 'breeding_records', 'rec-1', { confirmed_pregnant: 1 }),
    ];

    expect(mapCrudBatchToOperations(entries)).toEqual([
      { op: 'PATCH', table: 'breeding_records', id: 'rec-1', data: { confirmed_pregnant: 1 } },
    ]);
  });

  it('maps a DELETE with no data field', () => {
    const [operation] = mapCrudBatchToOperations([crud(UpdateType.DELETE, 'births', 'birth-9')]);

    expect(operation).toEqual({ op: 'DELETE', table: 'births', id: 'birth-9' });
    expect(operation).not.toHaveProperty('data');
  });

  it('defaults missing opData to an empty object for PUT/PATCH', () => {
    const entries = [crud(UpdateType.PUT, 'births', 'birth-1')];

    expect(mapCrudBatchToOperations(entries)).toEqual([
      { op: 'PUT', table: 'births', id: 'birth-1', data: {} },
    ]);
  });

  it('routes each entry to its own table and preserves order', () => {
    const entries = [
      crud(UpdateType.PUT, 'breeding_records', 'rec-1', { animal_name: 'Daisy' }),
      crud(UpdateType.PUT, 'births', 'birth-1', { does_count: 2 }),
    ];

    const result = mapCrudBatchToOperations(entries);

    expect(result.map((op) => op.table)).toEqual(['breeding_records', 'births']);
    expect(result.map((op) => op.id)).toEqual(['rec-1', 'birth-1']);
  });

  it('throws on an unknown table rather than uploading it', () => {
    const entries = [crud(UpdateType.PUT, 'ps_untyped', 'x', {})];

    expect(() => mapCrudBatchToOperations(entries)).toThrow(/unknown table "ps_untyped"/);
  });

  it('returns an empty array for an empty batch', () => {
    expect(mapCrudBatchToOperations([])).toEqual([]);
  });
});
