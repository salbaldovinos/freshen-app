import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { hasAnyBirth } from '@/db/queries/births';
import {
  getAllBreedingRecords,
  createBreedingRecord,
  updateBreedingRecord,
  deleteBreedingRecord,
  archiveBreedingRecord,
  confirmPregnancy,
} from '@/db/queries/breeding';
import type { BreedingRecord, NewBreedingRecord } from '@/db/schema';
import {
  calculateDaysBred,
  calculateDaysRemaining,
  calculateDueDate,
  getBreedingStatus,
  type BreedingStatus,
} from '@/lib/gestation';

// --- Types ---

export interface BreedingRecordWithComputed extends BreedingRecord {
  dueDate: string;
  daysBred: number;
  daysRemaining: number;
  status: BreedingStatus;
  hasBirth: boolean;
}

export type SortOption =
  | 'due_date_asc'
  | 'due_date_desc'
  | 'date_added_newest'
  | 'date_added_oldest'
  | 'name_az';

const SORT_OPTION_STORAGE_KEY = 'breeding_sort_option';
const DEFAULT_SORT_OPTION: SortOption = 'due_date_asc';

const VALID_SORT_OPTIONS: ReadonlySet<string> = new Set<SortOption>([
  'due_date_asc',
  'due_date_desc',
  'date_added_newest',
  'date_added_oldest',
  'name_az',
]);

// --- Sorting ---

function sortRecords(
  records: BreedingRecordWithComputed[],
  sortOption: SortOption,
): BreedingRecordWithComputed[] {
  const active = records.filter((r) => r.status !== 'archived');
  const archived = records.filter((r) => r.status === 'archived');

  const comparator = getComparator(sortOption);
  active.sort(comparator);
  archived.sort(comparator);

  return [...active, ...archived];
}

function getComparator(
  sortOption: SortOption,
): (a: BreedingRecordWithComputed, b: BreedingRecordWithComputed) => number {
  switch (sortOption) {
    case 'due_date_asc':
      return (a, b) => a.dueDate.localeCompare(b.dueDate);
    case 'due_date_desc':
      return (a, b) => b.dueDate.localeCompare(a.dueDate);
    case 'date_added_newest':
      return (a, b) => b.createdAt.localeCompare(a.createdAt);
    case 'date_added_oldest':
      return (a, b) => a.createdAt.localeCompare(b.createdAt);
    case 'name_az':
      return (a, b) => a.animalName.toLowerCase().localeCompare(b.animalName.toLowerCase());
  }
}

// --- Compute helper ---

async function computeRecordFields(record: BreedingRecord): Promise<BreedingRecordWithComputed> {
  const dueDate = calculateDueDate(record.pairingDate, record.gestationDays);
  const daysBred = calculateDaysBred(record.pairingDate);
  const daysRemaining = calculateDaysRemaining(dueDate);
  const hasBirth = await hasAnyBirth(record.id);
  const status = getBreedingStatus({
    confirmedPregnant: record.confirmedPregnant,
    archived: record.archived,
    hasBirth,
    pairingDate: record.pairingDate,
    gestationDays: record.gestationDays,
  });

  return {
    ...record,
    dueDate,
    daysBred,
    daysRemaining,
    status,
    hasBirth,
  };
}

// --- Store ---

interface BreedingStoreState {
  records: BreedingRecordWithComputed[];
  isLoading: boolean;
  error: string | null;
  sortOption: SortOption;
}

interface BreedingStoreActions {
  fetchRecords: () => Promise<void>;
  addRecord: (data: Omit<NewBreedingRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (id: string, data: Partial<NewBreedingRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  archiveRecord: (id: string) => Promise<void>;
  confirmPregnancy: (id: string) => Promise<void>;
  setSortOption: (option: SortOption) => Promise<void>;
}

export const useBreedingStore = create<BreedingStoreState & BreedingStoreActions>((set, get) => {
  // Load persisted sort option on store creation
  void AsyncStorage.getItem(SORT_OPTION_STORAGE_KEY).then((stored) => {
    if (stored && VALID_SORT_OPTIONS.has(stored)) {
      const option = stored as SortOption;
      const { records } = get();
      set({
        sortOption: option,
        records: sortRecords(records, option),
      });
    }
  });

  return {
    // State
    records: [],
    isLoading: false,
    error: null,
    sortOption: DEFAULT_SORT_OPTION,

    // Actions
    fetchRecords: async () => {
      set({ isLoading: true, error: null });
      try {
        const rawRecords = await getAllBreedingRecords();
        const computed = await Promise.all(rawRecords.map(computeRecordFields));
        const sorted = sortRecords(computed, get().sortOption);
        set({ records: sorted, isLoading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch records.';
        set({ error: message, isLoading: false });
      }
    },

    addRecord: async (data) => {
      try {
        await createBreedingRecord(data);
        await get().fetchRecords();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add record.';
        set({ error: message });
      }
    },

    updateRecord: async (id, data) => {
      try {
        await updateBreedingRecord(id, data);
        await get().fetchRecords();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update record.';
        set({ error: message });
      }
    },

    deleteRecord: async (id) => {
      try {
        await deleteBreedingRecord(id);
        await get().fetchRecords();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete record.';
        set({ error: message });
      }
    },

    archiveRecord: async (id) => {
      try {
        await archiveBreedingRecord(id);
        await get().fetchRecords();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to archive record.';
        set({ error: message });
      }
    },

    confirmPregnancy: async (id) => {
      try {
        await confirmPregnancy(id);
        await get().fetchRecords();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to confirm pregnancy.';
        set({ error: message });
      }
    },

    setSortOption: async (option) => {
      const { records } = get();
      const sorted = sortRecords(records, option);
      set({ sortOption: option, records: sorted });
      await AsyncStorage.setItem(SORT_OPTION_STORAGE_KEY, option);
    },
  };
});
