import {
  canAddAnimal,
  canEnableNotification,
  canSyncToCloud,
  canUploadPhoto,
  canExportData,
  canAccessSpecies,
} from '@/lib/tierChecks';
import type { SpeciesKey } from '@/constants/species';

describe('canAddAnimal', () => {
  it('returns true for free tier with count 0', () => {
    expect(canAddAnimal(0, 'free')).toBe(true);
  });

  it('returns true for free tier with count 9', () => {
    expect(canAddAnimal(9, 'free')).toBe(true);
  });

  it('returns false for free tier with count 10', () => {
    expect(canAddAnimal(10, 'free')).toBe(false);
  });

  it('returns false for free tier with count 11', () => {
    expect(canAddAnimal(11, 'free')).toBe(false);
  });

  it('returns true for paid tier with count 10', () => {
    expect(canAddAnimal(10, 'paid')).toBe(true);
  });

  it('returns true for paid tier with count 100', () => {
    expect(canAddAnimal(100, 'paid')).toBe(true);
  });
});

describe('canEnableNotification', () => {
  it('returns true for free tier with count 0', () => {
    expect(canEnableNotification(0, 'free')).toBe(true);
  });

  it('returns false for free tier with count 1', () => {
    expect(canEnableNotification(1, 'free')).toBe(false);
  });

  it('returns true for paid tier with count 1', () => {
    expect(canEnableNotification(1, 'paid')).toBe(true);
  });

  it('returns true for paid tier with count 50', () => {
    expect(canEnableNotification(50, 'paid')).toBe(true);
  });
});

describe('canSyncToCloud', () => {
  it('returns false for free tier', () => {
    expect(canSyncToCloud('free')).toBe(false);
  });

  it('returns true for paid tier', () => {
    expect(canSyncToCloud('paid')).toBe(true);
  });
});

describe('canUploadPhoto', () => {
  it('returns false for free tier', () => {
    expect(canUploadPhoto('free')).toBe(false);
  });

  it('returns true for paid tier', () => {
    expect(canUploadPhoto('paid')).toBe(true);
  });
});

describe('canExportData', () => {
  it('returns false for free tier', () => {
    expect(canExportData('free')).toBe(false);
  });

  it('returns true for paid tier', () => {
    expect(canExportData('paid')).toBe(true);
  });
});

describe('canAccessSpecies', () => {
  const nonGoatSpecies: SpeciesKey[] = ['sheep', 'pig', 'cattle', 'horse', 'donkey', 'rabbit'];
  const allSpecies: SpeciesKey[] = ['goat', ...nonGoatSpecies];

  it('returns true for free tier with goat', () => {
    expect(canAccessSpecies('goat', 'free')).toBe(true);
  });

  it.each(nonGoatSpecies)('returns false for free tier with %s', (species) => {
    expect(canAccessSpecies(species, 'free')).toBe(false);
  });

  it.each(allSpecies)('returns true for paid tier with %s', (species) => {
    expect(canAccessSpecies(species, 'paid')).toBe(true);
  });
});
