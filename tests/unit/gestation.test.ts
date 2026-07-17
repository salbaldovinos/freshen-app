import {
  calculateDueDate,
  calculateDaysBred,
  calculateDaysRemaining,
  getBreedingStatus,
  type BreedingStatus,
} from '@/lib/gestation';

describe('calculateDueDate', () => {
  it('calculates goat due date (150 days)', () => {
    expect(calculateDueDate('2026-01-01', 150)).toBe('2026-05-31');
  });

  it('calculates rabbit due date (31 days)', () => {
    expect(calculateDueDate('2026-03-01', 31)).toBe('2026-04-01');
  });

  it('handles year boundary', () => {
    expect(calculateDueDate('2025-12-01', 60)).toBe('2026-01-30');
  });

  it('handles leap year', () => {
    expect(calculateDueDate('2024-02-28', 1)).toBe('2024-02-29');
  });
});

describe('calculateDaysBred', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-18T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns correct days bred from pairing date to today', () => {
    expect(calculateDaysBred('2026-03-01')).toBe(17);
  });

  it('returns 0 when pairing date is today', () => {
    expect(calculateDaysBred('2026-03-18')).toBe(0);
  });

  it('returns large number for old pairing date', () => {
    expect(calculateDaysBred('2025-03-18')).toBe(365);
  });
});

describe('calculateDaysRemaining', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-18T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns positive when due date is in the future', () => {
    expect(calculateDaysRemaining('2026-04-01')).toBe(14);
  });

  it('returns 0 when due date is today', () => {
    expect(calculateDaysRemaining('2026-03-18')).toBe(0);
  });

  it('returns negative when overdue', () => {
    expect(calculateDaysRemaining('2026-03-10')).toBe(-8);
  });
});

describe('getBreedingStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-18T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseRecord = {
    confirmedPregnant: false,
    archived: false,
    hasBirth: false,
    pairingDate: '2026-03-01',
    gestationDays: 150,
  };

  it('returns "archived" when record is archived', () => {
    expect(getBreedingStatus({ ...baseRecord, archived: true })).toBe('archived');
  });

  it('returns "archived" even if record is overdue', () => {
    expect(
      getBreedingStatus({
        ...baseRecord,
        archived: true,
        confirmedPregnant: true,
        pairingDate: '2025-01-01',
        gestationDays: 30,
      }),
    ).toBe('archived');
  });

  it('returns "birth_logged" when birth exists', () => {
    expect(getBreedingStatus({ ...baseRecord, hasBirth: true })).toBe('birth_logged');
  });

  it('returns "birth_logged" even if record is overdue', () => {
    expect(
      getBreedingStatus({
        ...baseRecord,
        hasBirth: true,
        confirmedPregnant: true,
        pairingDate: '2025-01-01',
        gestationDays: 30,
      }),
    ).toBe('birth_logged');
  });

  it('returns "overdue" when not confirmed pregnant and past due date', () => {
    expect(
      getBreedingStatus({
        ...baseRecord,
        pairingDate: '2025-01-01',
        gestationDays: 30,
      }),
    ).toBe('overdue');
  });

  it('returns "overdue" when confirmed pregnant and past due date', () => {
    expect(
      getBreedingStatus({
        ...baseRecord,
        confirmedPregnant: true,
        pairingDate: '2025-01-01',
        gestationDays: 30,
      }),
    ).toBe('overdue');
  });

  it('returns "pregnant" when confirmed and not overdue', () => {
    expect(
      getBreedingStatus({
        ...baseRecord,
        confirmedPregnant: true,
      }),
    ).toBe('pregnant');
  });

  it('returns "bred" by default (not confirmed, not overdue)', () => {
    expect(getBreedingStatus(baseRecord)).toBe('bred');
  });
});
