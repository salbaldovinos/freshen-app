import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Cloud (Neon Postgres) schema. Column parity with the mobile SQLite schema
// (db/schema.ts at the repo root) plus a `user_id` owner column on every synced
// row. Column (snake_case) names match the mobile schema exactly so the sync
// upload endpoint can pass record fields straight through.

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user id (JWT `sub`)
  email: text('email'),
  tier: text('tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const breedingRecords = pgTable('breeding_records', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  animalName: text('animal_name').notNull(),
  sireName: text('sire_name'),
  pairingDate: text('pairing_date').notNull(),
  species: text('species').notNull(),
  gestationDays: integer('gestation_days').notNull(),
  notes: text('notes'),
  color: text('color').notNull().default('gray'),
  photoUrl: text('photo_url'),
  confirmedPregnant: boolean('confirmed_pregnant').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const births = pgTable('births', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  breedingRecordId: text('breeding_record_id')
    .notNull()
    .references(() => breedingRecords.id, { onDelete: 'cascade' }),
  birthDate: text('birth_date').notNull(),
  doesCount: integer('does_count').notNull(),
  bucksCount: integer('bucks_count').notNull(),
  stillbornCount: integer('stillborn_count').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type NewBreedingRecord = typeof breedingRecords.$inferInsert;
export type Birth = typeof births.$inferSelect;
export type NewBirth = typeof births.$inferInsert;
