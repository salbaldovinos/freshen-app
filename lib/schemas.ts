import { z } from 'zod';
import { parseISO, differenceInCalendarDays } from 'date-fns';
import type { SpeciesKey } from '@/constants/species';
import { SPECIES_CONFIG } from '@/constants/species';
import type { ColorTagValue } from '@/constants/theme';
import {
  ERROR_ANIMAL_NAME_REQUIRED,
  ERROR_ANIMAL_NAME_MAX,
  ERROR_SIRE_NAME_MAX,
  ERROR_PAIRING_DATE_FUTURE,
  ERROR_PAIRING_DATE_TOO_OLD,
  ERROR_GESTATION_DAYS_RANGE,
  ERROR_NOTES_BREEDING_MAX,
  ERROR_NOTES_BIRTH_MAX,
  ERROR_BIRTH_DATE_FUTURE,
  ERROR_BIRTH_DATE_BEFORE_PAIRING,
  ERROR_OFFSPRING_REQUIRED,
} from '@/constants/strings';

const SPECIES_KEYS = Object.keys(SPECIES_CONFIG) as [SpeciesKey, ...SpeciesKey[]];

const COLOR_TAG_VALUES: [ColorTagValue, ...ColorTagValue[]] = [
  'gray',
  'ember',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
];

export const breedingFormSchema = z.object({
  animalName: z
    .string({ error: ERROR_ANIMAL_NAME_REQUIRED })
    .min(1, ERROR_ANIMAL_NAME_REQUIRED)
    .max(50, ERROR_ANIMAL_NAME_MAX),
  sireName: z.string().max(50, ERROR_SIRE_NAME_MAX).optional(),
  pairingDate: z
    .string({ error: 'Pairing date is required.' })
    .refine(
      (val) => {
        const date = parseISO(val);
        const today = new Date();
        return differenceInCalendarDays(date, today) <= 0;
      },
      { message: ERROR_PAIRING_DATE_FUTURE },
    )
    .refine(
      (val) => {
        const date = parseISO(val);
        const today = new Date();
        return differenceInCalendarDays(today, date) <= 365;
      },
      { message: ERROR_PAIRING_DATE_TOO_OLD },
    ),
  species: z.enum(SPECIES_KEYS),
  gestationDays: z
    .number({ error: ERROR_GESTATION_DAYS_RANGE })
    .int(ERROR_GESTATION_DAYS_RANGE)
    .min(1, ERROR_GESTATION_DAYS_RANGE)
    .max(400, ERROR_GESTATION_DAYS_RANGE),
  notes: z.string().max(500, ERROR_NOTES_BREEDING_MAX).optional(),
  color: z.enum(COLOR_TAG_VALUES).default('gray'),
});

export type BreedingFormData = z.infer<typeof breedingFormSchema>;

export function createBirthFormSchema(pairingDate: string) {
  return z
    .object({
      birthDate: z
        .string({ error: 'Birth date is required.' })
        .refine(
          (val) => {
            const date = parseISO(val);
            const today = new Date();
            return differenceInCalendarDays(date, today) <= 0;
          },
          { message: ERROR_BIRTH_DATE_FUTURE },
        )
        .refine(
          (val) => {
            const date = parseISO(val);
            const pairing = parseISO(pairingDate);
            return differenceInCalendarDays(date, pairing) >= 0;
          },
          { message: ERROR_BIRTH_DATE_BEFORE_PAIRING },
        ),
      doesCount: z.number().int().min(0).max(20).default(0),
      bucksCount: z.number().int().min(0).max(20).default(0),
      stillbornCount: z.number().int().min(0).max(20).default(0),
      notes: z.string().max(300, ERROR_NOTES_BIRTH_MAX).optional(),
    })
    .refine((data) => data.doesCount + data.bucksCount > 0, {
      message: ERROR_OFFSPRING_REQUIRED,
      path: ['doesCount'],
    });
}

export type BirthFormData = z.infer<ReturnType<typeof createBirthFormSchema>>;
