import { format, parseISO } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { GestationBadge } from '@/components/breeding/GestationBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import { Toast } from '@/components/ui/toast';
import { COLORS, COLOR_TAGS } from '@/constants/theme';
import { SPECIES_CONFIG, type SpeciesKey } from '@/constants/species';
import {
  EMPTY_STATE_BIRTH_HISTORY,
  LABEL_DAYS_BRED,
  LABEL_DAYS_LEFT,
  LABEL_DUE_DATE,
  SIRE_UNKNOWN,
  ACTION_MARK_PREGNANT,
  ACTION_LOG_BIRTH,
  ACTION_LOG_ANOTHER_BIRTH,
  ACTION_ARCHIVE,
  ACTION_UNARCHIVE,
  ACTION_DELETE,
  CONFIRM_DELETE_TITLE,
  CONFIRM_DELETE_MESSAGE,
  TOAST_RECORD_DELETED,
  toastPregnancyConfirmed,
  TIER_FEATURE_LOCKED,
} from '@/constants/strings';
import { getBirthsByBreedingId } from '@/db/queries/births';
import type { Birth } from '@/db/schema';
import { useBreedingStore, type BreedingRecordWithComputed } from '@/store/useBreedingStore';
import { useToastStore } from '@/store/useToastStore';

// --- Sub-components ---

interface StatColumnProps {
  value: string;
  label: string;
  valueColor?: string;
}

function StatColumn({ value, label, valueColor }: StatColumnProps) {
  return (
    <View className="flex-1 items-center">
      <Text
        className="font-cormorant-semibold text-[40px] leading-[44px]"
        style={{ color: valueColor ?? COLORS.bark }}
      >
        {value}
      </Text>
      <Text
        className="mt-1 font-dm-sans text-[10px] uppercase tracking-wider"
        style={{ color: COLORS.mist }}
      >
        {label}
      </Text>
    </View>
  );
}

function formatFullDate(isoDate: string): string {
  return format(parseISO(isoDate), 'MMMM d, yyyy');
}

function formatShortDate(isoDate: string): string {
  return format(parseISO(isoDate), 'MMM d, yyyy');
}

function getOffspringSummary(birth: Birth, species: string): string {
  const config = SPECIES_CONFIG[species as SpeciesKey] ?? SPECIES_CONFIG.goat;
  const parts: string[] = [];

  if (birth.doesCount > 0) {
    parts.push(
      `${birth.doesCount} ${birth.doesCount === 1 ? config.offspringTermDoe : config.offspringTermDoe + 's'}`,
    );
  }
  if (birth.bucksCount > 0) {
    parts.push(
      `${birth.bucksCount} ${birth.bucksCount === 1 ? config.offspringTermBuck : config.offspringTermBuck + 's'}`,
    );
  }

  return parts.length > 0 ? parts.join(', ') : 'No live offspring';
}

// --- Info row ---

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <View className="flex-row justify-between py-[10px]">
      <Text className="font-dm-sans text-[13px]" style={{ color: COLORS.mist }}>
        {label}
      </Text>
      <View className="flex-row items-center">{children}</View>
    </View>
  );
}

// --- Main component ---

export interface BreedingDetailProps {
  record: BreedingRecordWithComputed;
}

export function BreedingDetail({ record }: BreedingDetailProps) {
  const router = useRouter();

  const confirmPregnancyAction = useBreedingStore((s) => s.confirmPregnancy);
  const archiveRecord = useBreedingStore((s) => s.archiveRecord);
  const updateRecord = useBreedingStore((s) => s.updateRecord);
  const deleteRecord = useBreedingStore((s) => s.deleteRecord);
  const showGlobalToast = useToastStore((s) => s.show);

  const [births, setBirths] = useState<Birth[]>([]);
  const [birthsLoaded, setBirthsLoaded] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Fetch birth records
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const results = await getBirthsByBreedingId(record.id);
        if (!cancelled) {
          setBirths(results);
          setBirthsLoaded(true);
        }
      } catch {
        if (!cancelled) {
          setBirthsLoaded(true);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [record.id, record.hasBirth]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  const handleMarkPregnant = useCallback(async () => {
    await confirmPregnancyAction(record.id);
    showToast(toastPregnancyConfirmed(record.animalName));
  }, [confirmPregnancyAction, record.id, record.animalName, showToast]);

  const handleArchive = useCallback(async () => {
    await archiveRecord(record.id);
  }, [archiveRecord, record.id]);

  const handleUnarchive = useCallback(async () => {
    await updateRecord(record.id, { archived: false });
  }, [updateRecord, record.id]);

  const handleDelete = useCallback(async () => {
    setShowDeleteDialog(false);
    await deleteRecord(record.id);
    showGlobalToast(TOAST_RECORD_DELETED);
    router.back();
  }, [deleteRecord, record.id, showGlobalToast, router]);

  const handleLogBirth = useCallback(() => {
    router.push(`/birth/${record.id}`);
  }, [router, record.id]);

  const handleEdit = useCallback(() => {
    router.push(`/(tabs)/add?id=${record.id}`);
  }, [router, record.id]);

  // Computed display values
  const speciesConfig = SPECIES_CONFIG[record.species as SpeciesKey] ?? SPECIES_CONFIG.goat;
  const colorTag = COLOR_TAGS.find((t) => t.value === record.color);
  const isOverdue = record.daysRemaining < 0;
  const daysLeftDisplay = isOverdue
    ? String(Math.abs(record.daysRemaining))
    : String(record.daysRemaining);
  const daysLeftLabel = isOverdue ? 'Overdue' : LABEL_DAYS_LEFT;

  return (
    <>
      <ScrollView className="flex-1 bg-parchment" contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Photo placeholder */}
        <View
          className="mx-4 mt-4 items-center justify-center overflow-hidden rounded-xl"
          style={{
            aspectRatio: 16 / 9,
            backgroundColor: COLORS.fog,
          }}
        >
          <View className="items-center">
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: COLORS.bark }}>
              <Text className="font-dm-sans-medium text-[11px] text-white">
                {TIER_FEATURE_LOCKED}
              </Text>
            </View>
          </View>
        </View>

        {/* Status section */}
        <View className="mx-4 mt-5 flex-row items-center justify-between">
          <GestationBadge status={record.status} />
          {record.status === 'bred' && (
            <Button size="sm" onPress={handleMarkPregnant}>
              {ACTION_MARK_PREGNANT}
            </Button>
          )}
          <View className="flex-1" />
          <Button variant="ghost" size="sm" onPress={handleEdit}>
            Edit
          </Button>
        </View>

        {/* Stats row */}
        <View
          className="mx-4 mt-5 flex-row rounded-xl px-2 py-4"
          style={{ backgroundColor: COLORS.cream }}
        >
          <StatColumn value={String(record.daysBred)} label={LABEL_DAYS_BRED} />
          <View style={{ width: 1, backgroundColor: COLORS.flax }} />
          <StatColumn
            value={daysLeftDisplay}
            label={daysLeftLabel}
            valueColor={isOverdue ? '#9E3A28' : undefined}
          />
          <View style={{ width: 1, backgroundColor: COLORS.flax }} />
          <StatColumn value={formatShortDate(record.dueDate)} label={LABEL_DUE_DATE} />
        </View>

        {/* Info section */}
        <View className="mx-4 mt-5">
          <Text
            className="font-dm-sans-medium text-[16px] uppercase tracking-wider"
            style={{ color: COLORS.bark }}
          >
            Details
          </Text>
          <View className="mt-2" style={{ borderTopWidth: 1, borderTopColor: COLORS.flax }}>
            <InfoRow label="Sire">
              <Text
                className="font-dm-sans text-[15px]"
                style={{ color: record.sireName ? COLORS.bark : COLORS.mist }}
              >
                {record.sireName ?? SIRE_UNKNOWN}
              </Text>
            </InfoRow>
            <InfoRow label="Species">
              <Text className="font-dm-sans text-[15px]" style={{ color: COLORS.bark }}>
                {speciesConfig.label}
              </Text>
            </InfoRow>
            <InfoRow label="Pairing date">
              <Text className="font-dm-sans text-[15px]" style={{ color: COLORS.bark }}>
                {formatFullDate(record.pairingDate)}
              </Text>
            </InfoRow>
            <InfoRow label="Gestation">
              <Text className="font-dm-sans text-[15px]" style={{ color: COLORS.bark }}>
                {record.gestationDays} days
              </Text>
            </InfoRow>
            {colorTag && (
              <InfoRow label="Color tag">
                <View className="flex-row items-center gap-2">
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: colorTag.hex,
                    }}
                  />
                  <Text className="font-dm-sans text-[15px]" style={{ color: COLORS.bark }}>
                    {colorTag.name}
                  </Text>
                </View>
              </InfoRow>
            )}
          </View>
        </View>

        {/* Notes section */}
        {record.notes ? (
          <View className="mx-4 mt-5">
            <Text
              className="font-dm-sans-medium text-[16px] uppercase tracking-wider"
              style={{ color: COLORS.bark }}
            >
              Notes
            </Text>
            <Text
              className="mt-2 font-dm-sans text-[15px] leading-[22px]"
              style={{ color: COLORS.bark }}
            >
              {record.notes}
            </Text>
          </View>
        ) : null}

        {/* Birth history section */}
        <View className="mx-4 mt-5">
          <View className="flex-row items-center gap-2">
            <Text
              className="font-dm-sans-medium text-[16px] uppercase tracking-wider"
              style={{ color: COLORS.bark }}
            >
              Births
            </Text>
            {births.length > 0 && (
              <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: COLORS.fog }}>
                <Text className="font-dm-sans-medium text-[11px]" style={{ color: COLORS.dusk }}>
                  ({births.length})
                </Text>
              </View>
            )}
          </View>

          {birthsLoaded && births.length === 0 && (
            <View className="mt-3">
              <Text className="font-dm-sans text-[14px]" style={{ color: COLORS.mist }}>
                {EMPTY_STATE_BIRTH_HISTORY}
              </Text>
              <View className="mt-3">
                <Button variant="secondary" size="sm" onPress={handleLogBirth}>
                  {ACTION_LOG_BIRTH}
                </Button>
              </View>
            </View>
          )}

          {births.length > 0 && (
            <View className="mt-3 gap-3">
              {births.map((birth) => (
                <View
                  key={birth.id}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: COLORS.cream,
                    borderWidth: 1,
                    borderColor: COLORS.flax,
                  }}
                >
                  <Text className="font-dm-sans-medium text-[14px]" style={{ color: COLORS.bark }}>
                    {formatFullDate(birth.birthDate)}
                  </Text>
                  <Text className="mt-1 font-dm-sans text-[14px]" style={{ color: COLORS.dusk }}>
                    {getOffspringSummary(birth, record.species)}
                  </Text>
                  {birth.stillbornCount > 0 && (
                    <Text
                      className="mt-0.5 font-dm-sans text-[13px]"
                      style={{ color: COLORS.mist }}
                    >
                      {birth.stillbornCount} stillborn
                    </Text>
                  )}
                  {birth.notes ? (
                    <Text
                      className="mt-1 font-dm-sans text-[13px]"
                      style={{ color: COLORS.mist }}
                      numberOfLines={2}
                    >
                      {birth.notes}
                    </Text>
                  ) : null}
                </View>
              ))}
              <Button variant="secondary" size="sm" onPress={handleLogBirth}>
                {ACTION_LOG_ANOTHER_BIRTH}
              </Button>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View className="mx-4 mt-8 gap-3 pb-4">
          {/* Archive / Unarchive */}
          {record.archived ? (
            <Button variant="ghost" size="lg" onPress={handleUnarchive}>
              {ACTION_UNARCHIVE}
            </Button>
          ) : !record.hasBirth ? (
            <Button variant="ghost" size="lg" onPress={handleArchive}>
              {ACTION_ARCHIVE}
            </Button>
          ) : null}

          {/* Delete */}
          <Button variant="destructive" size="lg" onPress={() => setShowDeleteDialog(true)}>
            {ACTION_DELETE}
          </Button>
        </View>
      </ScrollView>

      {/* Delete confirmation dialog */}
      <Dialog
        visible={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title={CONFIRM_DELETE_TITLE}
        description={CONFIRM_DELETE_MESSAGE}
      >
        <DialogActions>
          <Button variant="ghost" onPress={() => setShowDeleteDialog(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onPress={handleDelete}>
            {ACTION_DELETE}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
}
