import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

export type BreedingStatus = 'bred' | 'pregnant' | 'overdue' | 'birth_logged' | 'archived';

/**
 * Calculate due date from pairing date and gestation length.
 * @param pairingDate - ISO date string "YYYY-MM-DD"
 * @param gestationDays - integer, 1-400
 * @returns ISO date string "YYYY-MM-DD"
 */
export function calculateDueDate(pairingDate: string, gestationDays: number): string {
  const date = parseISO(pairingDate);
  const dueDate = addDays(date, gestationDays);
  return format(dueDate, 'yyyy-MM-dd');
}

/**
 * Calculate how many days have elapsed since pairing date.
 * @param pairingDate - ISO date string "YYYY-MM-DD"
 * @returns integer days from pairing to today
 */
export function calculateDaysBred(pairingDate: string): number {
  const date = parseISO(pairingDate);
  const today = new Date();
  return differenceInCalendarDays(today, date);
}

/**
 * Calculate days remaining until due date.
 * Returns positive value if due date is in the future.
 * Returns 0 if due today.
 * Returns negative value (days overdue) if past due date.
 * @param dueDate - ISO date string "YYYY-MM-DD"
 * @returns integer
 */
export function calculateDaysRemaining(dueDate: string): number {
  const date = parseISO(dueDate);
  const today = new Date();
  return differenceInCalendarDays(date, today);
}

/**
 * Determine the breeding status based on record state.
 * Priority: archived > birth_logged > overdue > pregnant > bred
 */
export function getBreedingStatus(record: {
  confirmedPregnant: boolean;
  archived: boolean;
  hasBirth: boolean;
  pairingDate: string;
  gestationDays: number;
}): BreedingStatus {
  if (record.archived) {
    return 'archived';
  }

  if (record.hasBirth) {
    return 'birth_logged';
  }

  const dueDate = calculateDueDate(record.pairingDate, record.gestationDays);
  const daysRemaining = calculateDaysRemaining(dueDate);

  if (daysRemaining < 0) {
    return 'overdue';
  }

  if (record.confirmedPregnant) {
    return 'pregnant';
  }

  return 'bred';
}
