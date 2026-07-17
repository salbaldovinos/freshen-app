/**
 * RevenueCat client wrapper.
 *
 * The whole app talks to RevenueCat through this module. Every entry point
 * degrades to the free tier when the SDK is not configured (no platform API key
 * present at runtime), and no path is allowed to throw — a purchase or restore
 * that fails resolves to a structured result the UI can render.
 */
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  PURCHASE_ERROR_ALREADY_OWNED,
  PURCHASE_ERROR_GENERIC,
  PURCHASE_ERROR_NETWORK,
  PURCHASE_ERROR_UNAVAILABLE,
  RESTORE_ERROR,
  RESTORE_NONE_FOUND,
  RESTORE_SUCCESS,
} from '@/constants/strings';

export type { CustomerInfo, PurchasesOffering, PurchasesPackage };

/** RevenueCat entitlement identifier that unlocks the paid tier. */
const PRO_ENTITLEMENT = 'pro';

/** Outcome of a purchase attempt. A user-cancelled purchase carries no message. */
export interface PurchaseResult {
  ok: boolean;
  cancelled: boolean;
  customerInfo?: CustomerInfo;
  message: string | null;
}

/** Outcome of a restore attempt. `message` is always user-facing copy to surface. */
export interface RestoreResult {
  ok: boolean;
  isPaid: boolean;
  customerInfo?: CustomerInfo;
  message: string;
}

let configured = false;

function platformApiKey(): string | undefined {
  return Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
    : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
}

/**
 * Configure the SDK once with the platform API key. No-ops (and never calls
 * configure) when the key is absent, leaving the app on the free tier. `userId`
 * sets the RevenueCat appUserID; omit it for an anonymous user.
 */
export async function initializePurchases(userId?: string): Promise<void> {
  if (configured) return;
  const apiKey = platformApiKey();
  if (!apiKey) return;
  try {
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
  } catch {
    configured = false;
  }
}

/** True once the SDK has been configured with a platform key. */
export function isConfigured(): boolean {
  return configured;
}

/**
 * Current customer info, or null when the SDK is unconfigured or the read fails.
 * Used to derive the launch tier without throwing.
 */
export async function getCustomerInfoSafe(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

/** The current offering, or null when unconfigured / unavailable. */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

/** True when the customer holds the active `pro` entitlement. */
export function isPaidTier(customerInfo: CustomerInfo): boolean {
  return typeof customerInfo.entitlements.active[PRO_ENTITLEMENT] !== 'undefined';
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<PurchaseResult> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: true, cancelled: false, customerInfo, message: null };
  } catch (error) {
    return mapPurchaseError(error);
  }
}

export async function restorePurchases(): Promise<RestoreResult> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    const paid = isPaidTier(customerInfo);
    return {
      ok: true,
      isPaid: paid,
      customerInfo,
      message: paid ? RESTORE_SUCCESS : RESTORE_NONE_FOUND,
    };
  } catch {
    return { ok: false, isPaid: false, message: RESTORE_ERROR };
  }
}

function mapPurchaseError(error: unknown): PurchaseResult {
  const rcError = error as { code?: string; userCancelled?: boolean | null };
  if (rcError?.userCancelled || rcError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
    return { ok: false, cancelled: true, message: null };
  }
  return { ok: false, cancelled: false, message: purchaseErrorMessage(rcError?.code) };
}

function purchaseErrorMessage(code: string | undefined): string {
  switch (code) {
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
    case PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR:
      return PURCHASE_ERROR_NETWORK;
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return PURCHASE_ERROR_UNAVAILABLE;
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return PURCHASE_ERROR_ALREADY_OWNED;
    default:
      return PURCHASE_ERROR_GENERIC;
  }
}
