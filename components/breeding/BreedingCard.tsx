import { format, parseISO } from 'date-fns';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { GestationBadge } from '@/components/breeding/GestationBadge';
import { Card } from '@/components/ui/card';
import { COLORS, COLOR_TAGS } from '@/constants/theme';
import {
  SIRE_UNKNOWN,
  LABEL_DAYS_BRED,
  LABEL_DAYS_LEFT,
  LABEL_DUE_DATE,
} from '@/constants/strings';
import type { BreedingRecordWithComputed } from '@/store/useBreedingStore';

export interface BreedingCardProps {
  record: BreedingRecordWithComputed;
  onPress: () => void;
  onLongPress: () => void;
}

function formatDueDate(dueDateIso: string): string {
  return format(parseISO(dueDateIso), 'MMM d');
}

function getColorTagHex(colorValue: string): string | null {
  if (colorValue === 'gray') return null;
  const tag = COLOR_TAGS.find((t) => t.value === colorValue);
  return tag?.hex ?? null;
}

export function BreedingCard({ record, onPress, onLongPress }: BreedingCardProps) {
  const isOverdue = record.status === 'overdue';
  const daysOverdue = isOverdue ? Math.abs(record.daysRemaining) : 0;
  const sireDisplay = record.sireName ? `\u00D7 ${record.sireName}` : SIRE_UNKNOWN;
  const colorDotHex = getColorTagHex(record.color);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <Card className="overflow-hidden">
        {isOverdue && (
          <View style={{ backgroundColor: COLORS.emberPale }} className="px-[18px] py-[6px]">
            <Text
              style={{ color: '#9E4A28' }}
              className="font-dm-sans-semibold text-[10px] uppercase tracking-wider"
            >
              OVERDUE — {daysOverdue} day{daysOverdue === 1 ? '' : 's'} past due
            </Text>
          </View>
        )}

        <View className="px-[18px] pb-[18px] pt-4">
          {/* Top row: animal name + status badge */}
          <View className="flex-row items-center justify-between">
            <Text
              className="font-cormorant-medium text-[24px] leading-[28px]"
              style={{ color: COLORS.bark }}
              numberOfLines={1}
            >
              {record.animalName}
            </Text>
            <GestationBadge status={record.status} />
          </View>

          {/* Sire name */}
          <Text className="mt-1 font-dm-sans text-[13px]" style={{ color: COLORS.mist }}>
            {sireDisplay}
          </Text>

          {/* Separator */}
          <View className="mt-[14px]" style={{ height: 1, backgroundColor: COLORS.flax }} />

          {/* Stats row */}
          <View className="mt-3 flex-row items-center justify-between">
            <StatColumn label={LABEL_DAYS_BRED} value={String(record.daysBred)} />
            <StatColumn label={LABEL_DAYS_LEFT} value={String(Math.max(record.daysRemaining, 0))} />
            <StatColumn label={LABEL_DUE_DATE} value={formatDueDate(record.dueDate)} />
          </View>

          {/* Color tag dot */}
          {colorDotHex && (
            <View className="mt-3 flex-row">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colorDotHex,
                }}
              />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

interface StatColumnProps {
  label: string;
  value: string;
}

function StatColumn({ label, value }: StatColumnProps) {
  return (
    <View className="items-center">
      <Text
        className="font-cormorant-medium text-[26px] leading-[30px]"
        style={{ color: COLORS.bark }}
      >
        {value}
      </Text>
      <Text
        className="mt-[2px] font-dm-sans text-[10px] uppercase tracking-wider"
        style={{ color: COLORS.mist }}
      >
        {label}
      </Text>
    </View>
  );
}
