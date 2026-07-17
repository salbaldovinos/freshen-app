import { breedingFormSchema, createBirthFormSchema } from '@/lib/schemas';

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-18T12:00:00'));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('breedingFormSchema', () => {
  const validBreeding = {
    animalName: 'Daisy',
    sireName: 'Buck',
    pairingDate: '2026-02-01',
    species: 'goat' as const,
    gestationDays: 150,
    notes: 'First breeding',
    color: 'green' as const,
  };

  it('accepts a valid breeding form', () => {
    const result = breedingFormSchema.safeParse(validBreeding);
    expect(result.success).toBe(true);
  });

  it('accepts a valid form with all optional fields empty', () => {
    const result = breedingFormSchema.safeParse({
      animalName: 'Daisy',
      pairingDate: '2026-02-01',
      species: 'goat',
      gestationDays: 150,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.color).toBe('gray');
    }
  });

  it('rejects empty animal name', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      animalName: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('animalName'));
      expect(nameError?.message).toBe('Animal name is required.');
    }
  });

  it('rejects animal name over 50 characters', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      animalName: 'A'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const nameError = result.error.issues.find((i) => i.path.includes('animalName'));
      expect(nameError?.message).toBe('Animal name must be 50 characters or less.');
    }
  });

  it('rejects sire name over 50 characters', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      sireName: 'B'.repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const sireError = result.error.issues.find((i) => i.path.includes('sireName'));
      expect(sireError?.message).toBe('Sire name must be 50 characters or less.');
    }
  });

  it('rejects a future pairing date', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      pairingDate: '2026-03-19',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes('pairingDate'));
      expect(dateError?.message).toBe('Pairing date cannot be in the future.');
    }
  });

  it('rejects a pairing date more than 365 days ago', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      pairingDate: '2025-03-17',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes('pairingDate'));
      expect(dateError?.message).toBe('Pairing date cannot be more than 365 days ago.');
    }
  });

  it('accepts a pairing date exactly 365 days ago', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      pairingDate: '2025-03-18',
    });
    expect(result.success).toBe(true);
  });

  it('rejects gestation days of 0', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      gestationDays: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const gestError = result.error.issues.find((i) => i.path.includes('gestationDays'));
      expect(gestError?.message).toBe('Gestation days must be between 1 and 400.');
    }
  });

  it('rejects gestation days of 401', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      gestationDays: 401,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const gestError = result.error.issues.find((i) => i.path.includes('gestationDays'));
      expect(gestError?.message).toBe('Gestation days must be between 1 and 400.');
    }
  });

  it('rejects notes over 500 characters', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      notes: 'X'.repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const notesError = result.error.issues.find((i) => i.path.includes('notes'));
      expect(notesError?.message).toBe('Notes must be 500 characters or less.');
    }
  });

  it('rejects an invalid species key', () => {
    const result = breedingFormSchema.safeParse({
      ...validBreeding,
      species: 'unicorn',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all valid species keys', () => {
    const speciesKeys = ['goat', 'sheep', 'pig', 'cattle', 'horse', 'donkey', 'rabbit'];
    for (const species of speciesKeys) {
      const result = breedingFormSchema.safeParse({
        ...validBreeding,
        species,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('birthFormSchema', () => {
  const birthSchema = createBirthFormSchema('2026-01-01');

  const validBirth = {
    birthDate: '2026-03-15',
    doesCount: 2,
    bucksCount: 1,
    stillbornCount: 0,
    notes: 'Healthy delivery',
  };

  it('accepts a valid birth form', () => {
    const result = birthSchema.safeParse(validBirth);
    expect(result.success).toBe(true);
  });

  it('rejects when all offspring counts are 0', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      doesCount: 0,
      bucksCount: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const offspringError = result.error.issues.find(
        (i) => i.message === 'Please enter at least one offspring.',
      );
      expect(offspringError).toBeDefined();
    }
  });

  it('rejects a count above 20 with the PRD copy', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      doesCount: 21,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const highError = result.error.issues.find(
        (i) => i.message === 'Offspring count seems high. Please double-check.',
      );
      expect(highError).toBeDefined();
    }
  });

  it('accepts doesCount=5, bucksCount=0', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      doesCount: 5,
      bucksCount: 0,
    });
    expect(result.success).toBe(true);
  });

  it('accepts doesCount=0, bucksCount=3', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      doesCount: 0,
      bucksCount: 3,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a future birth date', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      birthDate: '2026-03-19',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes('birthDate'));
      expect(dateError?.message).toBe('Birth date cannot be in the future.');
    }
  });

  it('rejects a birth date before the pairing date', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      birthDate: '2025-12-31',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const dateError = result.error.issues.find((i) => i.path.includes('birthDate'));
      expect(dateError?.message).toBe('Birth date cannot be before pairing date.');
    }
  });

  it('rejects notes over 300 characters', () => {
    const result = birthSchema.safeParse({
      ...validBirth,
      notes: 'Y'.repeat(301),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const notesError = result.error.issues.find((i) => i.path.includes('notes'));
      expect(notesError?.message).toBe('Notes must be 300 characters or less.');
    }
  });
});
