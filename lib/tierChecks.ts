import type { SpeciesKey } from '@/constants/species';

export type Tier = 'free' | 'paid';

const FREE_ANIMAL_LIMIT = 10;
const FREE_NOTIFICATION_LIMIT = 1;

export function canAddAnimal(currentCount: number, tier: Tier): boolean {
  if (tier === 'paid') return true;
  return currentCount < FREE_ANIMAL_LIMIT;
}

export function canEnableNotification(activeNotificationCount: number, tier: Tier): boolean {
  if (tier === 'paid') return true;
  return activeNotificationCount < FREE_NOTIFICATION_LIMIT;
}

export function canSyncToCloud(tier: Tier): boolean {
  if (tier === 'paid') return true;
  return false;
}

export function canUploadPhoto(tier: Tier): boolean {
  if (tier === 'paid') return true;
  return false;
}

export function canExportData(tier: Tier): boolean {
  if (tier === 'paid') return true;
  return false;
}

export function canAccessSpecies(species: SpeciesKey, tier: Tier): boolean {
  if (tier === 'paid') return true;
  return species === 'goat';
}
