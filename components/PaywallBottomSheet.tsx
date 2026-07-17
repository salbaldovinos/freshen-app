import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { COLORS } from '@/constants/theme';
import {
  PAYWALL_CTA_START_TRIAL,
  PAYWALL_DISMISS,
  PAYWALL_ERROR,
  PAYWALL_FEATURE_EXTRAS,
  PAYWALL_FEATURE_SYNC,
  PAYWALL_FEATURE_UNLIMITED,
  PAYWALL_HEADLINE,
  PAYWALL_LOADING,
  PAYWALL_RESTORE,
  PAYWALL_TRIAL_BADGE,
} from '@/constants/strings';
import { getOfferings, type PurchasesOffering, type PurchasesPackage } from '@/lib/purchases';
import { cn } from '@/lib/utils';
import { useTierStore } from '@/store/useTierStore';
import { useToastStore } from '@/store/useToastStore';

interface PaywallBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Soft paywalls show a "No thanks" dismiss; hard paywalls (animal limit) hide it. */
  dismissible?: boolean;
}

type LoadState = 'loading' | 'ready' | 'error';

const FEATURES = [PAYWALL_FEATURE_UNLIMITED, PAYWALL_FEATURE_SYNC, PAYWALL_FEATURE_EXTRAS];

/** A package offers a free trial when its product carries an introductory price. */
function hasFreeTrial(pkg: PurchasesPackage): boolean {
  return pkg.product.introPrice !== null;
}

export function PaywallBottomSheet({
  visible,
  onClose,
  dismissible = true,
}: PaywallBottomSheetProps) {
  const purchaseAndUpdate = useTierStore((s) => s.purchaseAndUpdate);
  const restoreAndUpdate = useTierStore((s) => s.restoreAndUpdate);
  const showToast = useToastStore((s) => s.show);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    setLoadState('loading');
    getOfferings()
      .then((current) => {
        if (!active) return;
        if (!current || current.availablePackages.length === 0) {
          setLoadState('error');
          return;
        }
        const trialPkg = current.availablePackages.find((p) => hasFreeTrial(p));
        setOffering(current);
        setSelectedId((trialPkg ?? current.availablePackages[0]).identifier);
        setLoadState('ready');
      })
      .catch(() => {
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [visible]);

  const handlePurchase = useCallback(async () => {
    const pkg = offering?.availablePackages.find((p) => p.identifier === selectedId);
    if (!pkg) return;
    setBusy(true);
    const result = await purchaseAndUpdate(pkg);
    setBusy(false);
    if (result.ok) {
      onClose();
      return;
    }
    // A cancelled purchase is intentional and stays silent per the PRD error table.
    if (!result.cancelled && result.message) {
      showToast(result.message);
    }
  }, [offering, selectedId, purchaseAndUpdate, onClose, showToast]);

  const handleRestore = useCallback(async () => {
    setBusy(true);
    const result = await restoreAndUpdate();
    setBusy(false);
    showToast(result.message);
    if (result.ok && result.isPaid) onClose();
  }, [restoreAndUpdate, showToast, onClose]);

  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="pt-2 pb-1">
        <Text className="font-cormorant-semibold text-[26px] text-bark text-center">
          {PAYWALL_HEADLINE}
        </Text>
      </View>

      <View className="mt-3 mb-4">
        {FEATURES.map((feature) => (
          <View key={feature} className="flex-row items-center mb-2">
            <View className="w-1.5 h-1.5 rounded-full bg-ember mr-2.5" />
            <Text className="font-dm-sans text-[15px] text-bark">{feature}</Text>
          </View>
        ))}
      </View>

      {loadState === 'loading' && (
        <View className="py-8 items-center">
          <ActivityIndicator color={COLORS.ember} />
          <Text className="font-dm-sans text-sm text-dusk mt-2">{PAYWALL_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View className="py-8">
          <Text className="font-dm-sans text-sm text-dusk text-center">{PAYWALL_ERROR}</Text>
        </View>
      )}

      {loadState === 'ready' && offering && (
        <View>
          {offering.availablePackages.map((pkg) => {
            const selected = pkg.identifier === selectedId;
            return (
              <Pressable
                key={pkg.identifier}
                onPress={() => setSelectedId(pkg.identifier)}
                className={cn(
                  'rounded-md border px-4 py-3 mb-2.5 flex-row items-center justify-between',
                  selected ? 'border-[1.5px] border-ember bg-ember-pale' : 'border-sand bg-white',
                )}
              >
                <View className="flex-row items-center flex-shrink pr-2">
                  <Text className="font-dm-sans-medium text-[15px] text-bark">
                    {pkg.product.title}
                  </Text>
                  {hasFreeTrial(pkg) && (
                    <View className="ml-2 rounded-full bg-pasture-pale px-2 py-0.5">
                      <Text className="font-dm-sans-medium text-[11px] text-pasture-deep">
                        {PAYWALL_TRIAL_BADGE}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="font-dm-sans-medium text-[15px] text-bark">
                  {pkg.product.priceString}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View className="mt-3">
        <Button
          onPress={handlePurchase}
          loading={busy}
          disabled={loadState !== 'ready' || busy || !selectedId}
          size="lg"
        >
          {PAYWALL_CTA_START_TRIAL}
        </Button>
      </View>

      <Pressable
        className="mt-3 py-1"
        onPress={handleRestore}
        disabled={busy}
        testID="paywall-restore"
      >
        <Text className="font-dm-sans text-sm text-ember text-center">{PAYWALL_RESTORE}</Text>
      </Pressable>

      {dismissible && (
        <Pressable className="mt-1 py-1" onPress={onClose} disabled={busy} testID="paywall-dismiss">
          <Text className="font-dm-sans text-sm text-dusk text-center">{PAYWALL_DISMISS}</Text>
        </Pressable>
      )}
    </Sheet>
  );
}
