export type SpeciesKey = 'goat' | 'sheep' | 'pig' | 'cattle' | 'horse' | 'donkey' | 'rabbit';

export interface SpeciesConfig {
  label: string;
  gestationDays: number;
  offspringTermDoe: string;
  offspringTermBuck: string;
}

export const SPECIES_CONFIG: Record<SpeciesKey, SpeciesConfig> = {
  goat: {
    label: 'Goat',
    gestationDays: 150,
    offspringTermDoe: 'Doe',
    offspringTermBuck: 'Buck',
  },
  sheep: {
    label: 'Sheep',
    gestationDays: 147,
    offspringTermDoe: 'Ewe lamb',
    offspringTermBuck: 'Ram lamb',
  },
  pig: {
    label: 'Pig',
    gestationDays: 114,
    offspringTermDoe: 'Gilt',
    offspringTermBuck: 'Boar piglet',
  },
  cattle: {
    label: 'Cattle',
    gestationDays: 283,
    offspringTermDoe: 'Heifer calf',
    offspringTermBuck: 'Bull calf',
  },
  horse: {
    label: 'Horse',
    gestationDays: 340,
    offspringTermDoe: 'Filly',
    offspringTermBuck: 'Colt',
  },
  donkey: {
    label: 'Donkey',
    gestationDays: 365,
    offspringTermDoe: 'Jenny foal',
    offspringTermBuck: 'Jack foal',
  },
  rabbit: {
    label: 'Rabbit',
    gestationDays: 31,
    offspringTermDoe: 'Doe kit',
    offspringTermBuck: 'Buck kit',
  },
} as const;
