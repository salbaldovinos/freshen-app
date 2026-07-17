import { create } from 'zustand';

import type { Tier } from '@/lib/tierChecks';

interface TierStoreState {
  tier: Tier;
  isLoading: boolean;
}

interface TierStoreActions {
  initialize: () => void;
  setTier: (tier: Tier) => void;
}

export const useTierStore = create<TierStoreState & TierStoreActions>((set) => ({
  // State defaults
  tier: 'free' as Tier,
  isLoading: false,

  // Actions
  initialize: () => {
    // MVP: always free. RevenueCat integration comes in Phase 7.
    set({ tier: 'free', isLoading: false });
  },

  setTier: (tier: Tier) => {
    set({ tier });
  },
}));
