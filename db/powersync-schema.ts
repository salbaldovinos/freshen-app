import { column, Schema, Table } from '@powersync/react-native';

// PowerSync client schema (paid tier only). Mirrors the column names and types of
// db/schema.ts so synced rows map 1:1 onto the local Drizzle tables. PowerSync
// only stores TEXT / INTEGER / REAL: booleans (confirmed_pregnant, archived) live
// as INTEGER 0/1 and dates as ISO TEXT, exactly as db/schema.ts stores them.
//
// `id` is implicit — PowerSync creates the text primary key for every table, so it
// is never declared here. `user_id` is intentionally omitted: it is set server-side
// from the verified JWT (see backend/lib/syncUpload.ts) and never surfaced locally.

const breeding_records = new Table({
  animal_name: column.text,
  sire_name: column.text,
  pairing_date: column.text,
  species: column.text,
  gestation_days: column.integer,
  notes: column.text,
  color: column.text,
  photo_url: column.text,
  confirmed_pregnant: column.integer,
  archived: column.integer,
  created_at: column.text,
  updated_at: column.text,
});

const births = new Table({
  breeding_record_id: column.text,
  birth_date: column.text,
  does_count: column.integer,
  bucks_count: column.integer,
  stillborn_count: column.integer,
  notes: column.text,
  created_at: column.text,
});

export const AppSchema = new Schema({ breeding_records, births });

export type Database = (typeof AppSchema)['types'];
