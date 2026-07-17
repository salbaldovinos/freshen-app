import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

import { BreedingForm } from '@/components/breeding/BreedingForm';
import { PaywallBottomSheet } from '@/components/PaywallBottomSheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import {
  ACTION_SAVE,
  ACTION_SAVE_CHANGES,
  ACTION_DELETE,
  CONFIRM_DELETE_TITLE,
  CONFIRM_DELETE_MESSAGE,
  TOAST_RECORD_SAVED,
  TOAST_RECORD_DELETED,
} from '@/constants/strings';
import { canAddAnimal } from '@/lib/tierChecks';
import type { BreedingFormData } from '@/lib/schemas';
import { useBreedingStore, type BreedingRecordWithComputed } from '@/store/useBreedingStore';
import { useTierStore } from '@/store/useTierStore';
import { useToastStore } from '@/store/useToastStore';

export default function AddScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const records = useBreedingStore((s) => s.records);
  const addRecord = useBreedingStore((s) => s.addRecord);
  const updateRecord = useBreedingStore((s) => s.updateRecord);
  const deleteRecord = useBreedingStore((s) => s.deleteRecord);
  const showToast = useToastStore((s) => s.show);
  const tier = useTierStore((s) => s.tier);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [existingRecord, setExistingRecord] = useState<BreedingRecordWithComputed | undefined>();
  // The animal-limit paywall is hard (no dismiss); the species paywall is soft.
  const [paywall, setPaywall] = useState<{ visible: boolean; dismissible: boolean }>({
    visible: false,
    dismissible: true,
  });

  const openPaywall = useCallback((dismissible: boolean) => {
    setPaywall({ visible: true, dismissible });
  }, []);

  const closePaywall = useCallback(() => {
    setPaywall((prev) => ({ ...prev, visible: false }));
  }, []);

  // Find the existing record for edit mode
  useEffect(() => {
    if (id) {
      const found = records.find((r) => r.id === id);
      setExistingRecord(found);
    }
  }, [id, records]);

  // Build initial data for edit mode
  const initialData: BreedingFormData | undefined = existingRecord
    ? {
        animalName: existingRecord.animalName,
        sireName: existingRecord.sireName ?? undefined,
        pairingDate: existingRecord.pairingDate,
        species: existingRecord.species as BreedingFormData['species'],
        gestationDays: existingRecord.gestationDays,
        notes: existingRecord.notes ?? undefined,
        color: (existingRecord.color as BreedingFormData['color']) ?? 'gray',
      }
    : undefined;

  const handleSubmit = useCallback(
    async (data: BreedingFormData) => {
      // Hard paywall: block a genuinely new animal past the free limit. Records that
      // reuse an existing animal name don't add an animal, so they aren't gated.
      if (!isEditMode) {
        const activeAnimalNames = new Set(
          records.filter((r) => !r.archived).map((r) => r.animalName.trim().toLowerCase()),
        );
        const isNewAnimal = !activeAnimalNames.has(data.animalName.trim().toLowerCase());
        if (isNewAnimal && !canAddAnimal(activeAnimalNames.size, tier)) {
          openPaywall(false);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        if (isEditMode && id) {
          await updateRecord(id, {
            animalName: data.animalName,
            sireName: data.sireName ?? null,
            pairingDate: data.pairingDate,
            species: data.species,
            gestationDays: data.gestationDays,
            notes: data.notes ?? null,
            color: data.color,
          });
        } else {
          await addRecord({
            animalName: data.animalName,
            sireName: data.sireName ?? null,
            pairingDate: data.pairingDate,
            species: data.species,
            gestationDays: data.gestationDays,
            notes: data.notes ?? null,
            color: data.color,
            confirmedPregnant: false,
            archived: false,
            photoUrl: null,
          });
        }
        showToast(TOAST_RECORD_SAVED);
        router.back();
      } catch {
        Alert.alert('Error', 'Failed to save. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isEditMode, id, records, tier, openPaywall, addRecord, updateRecord, router, showToast],
  );

  const handleDelete = useCallback(async () => {
    if (!id) return;
    setShowDeleteDialog(false);
    setIsSubmitting(true);
    try {
      await deleteRecord(id);
      showToast(TOAST_RECORD_DELETED);
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to delete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [id, deleteRecord, router, showToast]);

  const screenTitle = isEditMode ? 'Edit breeding' : 'Add breeding';

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />
      <ScrollView
        className="flex-1 bg-parchment"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Only render form in edit mode once we have the existing record */}
        {isEditMode && !existingRecord ? null : (
          <BreedingForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={isEditMode ? ACTION_SAVE_CHANGES : ACTION_SAVE}
            tier={tier}
            onLockedSpeciesPress={() => openPaywall(true)}
          />
        )}

        {/* Delete button — edit mode only */}
        {isEditMode && existingRecord && (
          <View className="mt-6">
            <Button
              variant="destructive"
              size="lg"
              onPress={() => setShowDeleteDialog(true)}
              disabled={isSubmitting}
            >
              {ACTION_DELETE}
            </Button>
          </View>
        )}
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

      <PaywallBottomSheet
        visible={paywall.visible}
        dismissible={paywall.dismissible}
        onClose={closePaywall}
      />
    </>
  );
}
