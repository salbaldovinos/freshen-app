export const COLORS = {
  // Primary palette
  ember: '#C4603A',
  harvest: '#D4A842',
  pasture: '#6B8F71',
  parchment: '#F7F2E8',
  bark: '#261C10',
  dusk: '#7A6652',
  mist: '#B8A898',

  // Ember scale
  emberDeep: '#9E4A28',
  emberWarm: '#D07048',
  emberLight: '#E49070',
  emberPale: '#F5E0D0',

  // Harvest scale
  harvestDeep: '#A87E22',
  harvestLight: '#E8C870',
  harvestPale: '#FAF0D0',

  // Pasture scale
  pastureDeep: '#4E6E54',
  pastureLight: '#9DB8A2',
  pasturePale: '#DDE9DE',

  // Neutral scale
  barkMid: '#4A3828',
  sand: '#D8CCB8',
  fog: '#EAE4DC',
  flax: '#EDE5D2',
  cream: '#FDFAF4',
  white: '#FFFFFF',

  // Destructive
  destructive: '#B34030',
  destructiveBorder: '#EAC0BB',
} as const;

export const STATUS_COLORS = {
  bred: {
    bg: '#FEF4C0',
    text: '#8A6A10',
    dot: '#D4A842',
  },
  pregnant: {
    bg: '#D5EDDA',
    text: '#2C6E3C',
    dot: '#6B8F71',
  },
  overdue: {
    bg: '#FFDCD4',
    text: '#9E3A28',
    dot: '#C4603A',
  },
  birthLogged: {
    bg: '#D4E8F7',
    text: '#1A5E8A',
    dot: '#3A7EB4',
  },
  archived: {
    bg: '#EAE4DC',
    text: '#7A6652',
    dot: '#B8A898',
  },
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 14,
  xl: 20,
  xxl: 28,
} as const;

export type ColorTagValue =
  | 'gray'
  | 'ember'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'blue'
  | 'purple';

export const COLOR_TAGS: readonly {
  name: string;
  value: ColorTagValue;
  hex: string;
}[] = [
  { name: 'Gray', value: 'gray', hex: '#B8A898' },
  { name: 'Ember', value: 'ember', hex: '#C4603A' },
  { name: 'Orange', value: 'orange', hex: '#D4813A' },
  { name: 'Harvest', value: 'yellow', hex: '#D4A842' },
  { name: 'Pasture', value: 'green', hex: '#6B8F71' },
  { name: 'Teal', value: 'teal', hex: '#4A8F8A' },
  { name: 'Blue', value: 'blue', hex: '#3A7EB4' },
  { name: 'Purple', value: 'purple', hex: '#7B5EA7' },
] as const;
