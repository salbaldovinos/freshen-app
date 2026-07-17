import { create } from 'zustand';

import {
  getCustomerInfoSafe,
  isPaidTier,
  purchasePackage,
  restorePurchases,
  type PurchasesPackage,
  type PurchaseResult,
  type RestoreResult,
} from '@/lib/purchases';
import type { Tier } from '@/lib/tierChecks';

interface TierStoreState {
  tier: Tier;
  isLoading: boolean;
}

interface TierStoreActions {
  /** Read the current entitlement from RevenueCat; falls back to free when unconfigured. */
  initialize: () => Promise<void>;
  setTier: (tier: Tier) => void;
  /** Purchase a package and update the tier from the resulting entitlement. */
  purchaseAndUpdate: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  /** Restore prior purchases and update the tier from the resulting entitlement. */
  restoreAndUpdate: () => Promise<RestoreResult>;
}

export const useTierStore = create<TierStoreState & TierStoreActions>((set) => ({
  // State defaults
  tier: 'free' as Tier,
  isLoading: false,

  // Actions
  initialize: async () => {
    set({ isLoading: true });
    const customerInfo = await getCustomerInfoSafe();
    set({
      tier: customerInfo && isPaidTier(customerInfo) ? 'paid' : 'free',
      isLoading: false,
    });
  },

  setTier: (tier: Tier) => {
    set({ tier });
  },

  purchaseAndUpdate: async (pkg) => {
    const result = await purchasePackage(pkg);
    if (result.ok && result.customerInfo) {
      set({ tier: isPaidTier(result.customerInfo) ? 'paid' : 'free' });
    }
    return result;
  },

  restoreAndUpdate: async () => {
    const result = await restorePurchases();
    if (result.ok && result.customerInfo) {
      set({ tier: result.isPaid ? 'paid' : 'free' });
    }
    return result;
  },
}));
