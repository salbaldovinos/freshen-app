import { PURCHASES_ERROR_CODE } from 'react-native-purchases';

import type { CustomerInfo, PurchasesPackage } from '@/lib/purchases';
import {
  PURCHASE_ERROR_ALREADY_OWNED,
  PURCHASE_ERROR_GENERIC,
  PURCHASE_ERROR_NETWORK,
  PURCHASE_ERROR_UNAVAILABLE,
  RESTORE_ERROR,
  RESTORE_NONE_FOUND,
  RESTORE_SUCCESS,
} from '@/constants/strings';

const mockSetLogLevel = jest.fn();
const mockConfigure = jest.fn();
const mockGetOfferings = jest.fn();
const mockPurchasePackage = jest.fn();
const mockRestorePurchases = jest.fn();
const mockGetCustomerInfo = jest.fn();

// Only Platform is used by lib/purchases; the unit project has no RN preset.
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

// babel-preset-expo rewrites `process.env.EXPO_PUBLIC_*` to an import from
// 'expo/virtual/env'; mirror it so the test's process.env mutations flow through.
jest.mock('expo/virtual/env', () => ({ __esModule: true, env: process.env }));

jest.mock('react-native-purchases', () => {
  // Real enums so the lib's code comparisons match the test's error codes.
  const actual = jest.requireActual('@revenuecat/purchases-typescript-internal');
  return {
    __esModule: true,
    default: {
      setLogLevel: mockSetLogLevel,
      configure: mockConfigure,
      getOfferings: mockGetOfferings,
      purchasePackage: mockPurchasePackage,
      restorePurchases: mockRestorePurchases,
      getCustomerInfo: mockGetCustomerInfo,
    },
    LOG_LEVEL: actual.LOG_LEVEL,
    PURCHASES_ERROR_CODE: actual.PURCHASES_ERROR_CODE,
  };
});

const paidInfo = {
  entitlements: { active: { pro: {} } },
} as unknown as CustomerInfo;
const freeInfo = {
  entitlements: { active: {} },
} as unknown as CustomerInfo;
const pkg = { identifier: 'freshen_annual' } as unknown as PurchasesPackage;

// Fresh module registry per call so the module-level `configured` flag resets.
const loadLib = (): typeof import('@/lib/purchases') => {
  jest.resetModules();
  return jest.requireActual('@/lib/purchases');
};

beforeEach(() => {
  // resetAllMocks (not clearAllMocks) so implementations set in one test — e.g. a
  // throwing configure — don't leak into the next.
  jest.resetAllMocks();
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;
  mockSetLogLevel.mockResolvedValue(undefined);
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = 'appl_test_key';
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
});

describe('initializePurchases', () => {
  it('no-ops (never calls configure) when the platform key is missing', async () => {
    delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
    const lib = loadLib();
    await expect(lib.initializePurchases()).resolves.toBeUndefined();
    expect(mockConfigure).not.toHaveBeenCalled();
    expect(lib.isConfigured()).toBe(false);
  });

  it('configures with the platform key and app user id when present', async () => {
    const lib = loadLib();
    await lib.initializePurchases('user_123');
    expect(mockConfigure).toHaveBeenCalledWith({
      apiKey: 'appl_test_key',
      appUserID: 'user_123',
    });
    expect(lib.isConfigured()).toBe(true);
  });

  it('never throws and stays unconfigured when configure fails', async () => {
    mockConfigure.mockImplementation(() => {
      throw new Error('boom');
    });
    const lib = loadLib();
    await expect(lib.initializePurchases()).resolves.toBeUndefined();
    expect(lib.isConfigured()).toBe(false);
  });
});

describe('isPaidTier', () => {
  it('is true when the pro entitlement is active', () => {
    const lib = loadLib();
    expect(lib.isPaidTier(paidInfo)).toBe(true);
  });

  it('is false when there is no active pro entitlement', () => {
    const lib = loadLib();
    expect(lib.isPaidTier(freeInfo)).toBe(false);
  });
});

describe('purchasePackage', () => {
  it('returns success with customer info on a completed purchase', async () => {
    mockPurchasePackage.mockResolvedValue({
      productIdentifier: 'freshen_annual',
      customerInfo: paidInfo,
    });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result).toEqual({ ok: true, cancelled: false, customerInfo: paidInfo, message: null });
  });

  it('maps a userCancelled error to a silent cancellation', async () => {
    mockPurchasePackage.mockRejectedValue({ userCancelled: true });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result).toEqual({ ok: false, cancelled: true, message: null });
  });

  it('maps the PURCHASE_CANCELLED_ERROR code to a silent cancellation', async () => {
    mockPurchasePackage.mockRejectedValue({ code: PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result).toEqual({ ok: false, cancelled: true, message: null });
  });

  it('maps a network error to the network copy', async () => {
    mockPurchasePackage.mockRejectedValue({ code: PURCHASES_ERROR_CODE.NETWORK_ERROR });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result).toEqual({ ok: false, cancelled: false, message: PURCHASE_ERROR_NETWORK });
  });

  it('maps a product-unavailable error to the region copy', async () => {
    mockPurchasePackage.mockRejectedValue({
      code: PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR,
    });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result.message).toBe(PURCHASE_ERROR_UNAVAILABLE);
  });

  it('maps an already-purchased error to the restore-hint copy', async () => {
    mockPurchasePackage.mockRejectedValue({
      code: PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR,
    });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result.message).toBe(PURCHASE_ERROR_ALREADY_OWNED);
  });

  it('maps an unrecognized error code to the generic copy', async () => {
    mockPurchasePackage.mockRejectedValue({ code: '999' });
    const lib = loadLib();
    const result = await lib.purchasePackage(pkg);
    expect(result).toEqual({ ok: false, cancelled: false, message: PURCHASE_ERROR_GENERIC });
  });
});

describe('restorePurchases', () => {
  it('reports success when the restore yields an active entitlement', async () => {
    mockRestorePurchases.mockResolvedValue(paidInfo);
    const lib = loadLib();
    const result = await lib.restorePurchases();
    expect(result).toEqual({
      ok: true,
      isPaid: true,
      customerInfo: paidInfo,
      message: RESTORE_SUCCESS,
    });
  });

  it('reports no active purchases when nothing is restored', async () => {
    mockRestorePurchases.mockResolvedValue(freeInfo);
    const lib = loadLib();
    const result = await lib.restorePurchases();
    expect(result.isPaid).toBe(false);
    expect(result.message).toBe(RESTORE_NONE_FOUND);
  });

  it('reports a failure message when the restore throws', async () => {
    mockRestorePurchases.mockRejectedValue(new Error('offline'));
    const lib = loadLib();
    const result = await lib.restorePurchases();
    expect(result).toEqual({ ok: false, isPaid: false, message: RESTORE_ERROR });
  });
});

describe('useTierStore', () => {
  const loadStore = () => {
    jest.resetModules();
    const lib = jest.requireActual('@/lib/purchases') as typeof import('@/lib/purchases');
    const { useTierStore } = jest.requireActual(
      '@/store/useTierStore',
    ) as typeof import('@/store/useTierStore');
    return { lib, useTierStore };
  };

  it('falls back to free when the SDK is unconfigured', async () => {
    const { useTierStore } = loadStore();
    await useTierStore.getState().initialize();
    expect(useTierStore.getState().tier).toBe('free');
    expect(mockGetCustomerInfo).not.toHaveBeenCalled();
  });

  it('reads the paid tier from an active entitlement after configuration', async () => {
    const { lib, useTierStore } = loadStore();
    await lib.initializePurchases();
    mockGetCustomerInfo.mockResolvedValue(paidInfo);
    await useTierStore.getState().initialize();
    expect(useTierStore.getState().tier).toBe('paid');
  });

  it('updates the tier to paid after a successful purchase', async () => {
    mockPurchasePackage.mockResolvedValue({
      productIdentifier: 'freshen_annual',
      customerInfo: paidInfo,
    });
    const { useTierStore } = loadStore();
    const result = await useTierStore.getState().purchaseAndUpdate(pkg);
    expect(result.ok).toBe(true);
    expect(useTierStore.getState().tier).toBe('paid');
  });
});
