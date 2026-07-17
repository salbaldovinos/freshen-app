import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const breedingRecords = sqliteTable('breeding_records', {
  id: text('id').primaryKey(),
  animalName: text('animal_name').notNull(),
  sireName: text('sire_name'),
  pairingDate: text('pairing_date').notNull(),
  species: text('species').notNull(),
  gestationDays: integer('gestation_days').notNull(),
  notes: text('notes'),
  color: text('color').notNull().default('gray'),
  photoUrl: text('photo_url'),
  confirmedPregnant: integer('confirmed_pregnant', { mode: 'boolean' }).notNull().default(false),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const births = sqliteTable('births', {
  id: text('id').primaryKey(),
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

export type BreedingRecord = typeof breedingRecords.$inferSelect;
export type NewBreedingRecord = typeof breedingRecords.$inferInsert;
export type Birth = typeof births.$inferSelect;
export type NewBirth = typeof births.$inferInsert;
