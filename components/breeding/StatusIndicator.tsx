import { formatDistanceToNow } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, Text } from 'react-native';

import { Sheet } from '@/components/ui/sheet';
import { COLORS } from '@/constants/theme';
import {
  SYNC_LAST_SYNCED_LABEL,
  SYNC_NEVER_SYNCED,
  SYNC_OFFLINE_MESSAGE,
  SYNC_SHEET_TITLE,
  SYNC_STATUS_OFFLINE,
  SYNC_STATUS_SYNCED,
  SYNC_STATUS_SYNCING,
} from '@/constants/strings';
import type { SyncStatusValue } from '@/lib/sync';

// Sync status indicator for the home header (paid tier only). Props-driven so it
// renders without the PowerSync SDK. Three states per the design system, no emoji:
//   synced  — green dot   syncing — blue dot, pulsing opacity   offline — gray dot
// Tapping opens a bottom sheet with the last-sync time (or the offline message).

// Blue has no COLORS token; use the design system's blue status/tag hue directly.
const SYNCING_BLUE = '#3A7EB4';

const STATE_CONFIG: Record<SyncStatusValue, { color: string; label: string }> = {
  synced: { color: COLORS.pasture, label: SYNC_STATUS_SYNCED },
  syncing: { color: SYNCING_BLUE, label: SYNC_STATUS_SYNCING },
  offline: { color: COLORS.mist, label: SYNC_STATUS_OFFLINE },
};

export interface StatusIndicatorProps {
  status: SyncStatusValue;
  lastSyncedAt?: Date | null;
}

export function StatusIndicator({ status, lastSyncedAt }: StatusIndicatorProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;
  const { color, label } = STATE_CONFIG[status];

  useEffect(() => {
    if (status !== 'syncing') {
      pulse.setValue(1);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [status, pulse]);

  const detail =
    status === 'offline'
      ? SYNC_OFFLINE_MESSAGE
      : lastSyncedAt
        ? `${SYNC_LAST_SYNCED_LABEL} ${formatDistanceToNow(lastSyncedAt, { addSuffix: true })}`
        : SYNC_NEVER_SYNCED;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sync status: ${label}`}
        onPress={() => setSheetVisible(true)}
        className="flex-row items-center gap-1.5 px-2 py-1"
      >
        <Animated.View
          style={{ backgroundColor: color, opacity: status === 'syncing' ? pulse : 1 }}
          className="h-2 w-2 rounded-full"
        />
        <Text className="font-dm-sans-medium text-xs text-dusk">{label}</Text>
      </Pressable>

      <Sheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title={SYNC_SHEET_TITLE}>
        <Text className="font-dm-sans text-base text-bark">{detail}</Text>
      </Sheet>
    </>
  );
}
