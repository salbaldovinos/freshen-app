import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { COLORS } from '@/constants/theme';
import { SPECIES_CONFIG } from '@/constants/species';
import type { SpeciesKey } from '@/constants/species';
import {
  LABEL_BIRTH_DATE,
  LABEL_DOES_COUNT,
  LABEL_BUCKS_COUNT,
  LABEL_STILLBORN_COUNT,
  LABEL_NOTES,
  ACTION_SAVE_BIRTH,
  PLACEHOLDER_NOTES,
  toastBirthLogged,
} from '@/constants/strings';
import { createBirthFormSchema } from '@/lib/schemas';
import { createBirth } from '@/db/queries/births';
import { useBreedingStore } from '@/store/useBreedingStore';
import { useToastStore } from '@/store/useToastStore';

const NOTES_MAX_LENGTH = 300;

export default function LogBirthScreen() {
  const router = useRouter();
  const { breedingId } = useLocalSearchParams<{ breedingId: string }>();

  const records = useBreedingStore((s) => s.records);
  const fetchRecords = useBreedingStore((s) => s.fetchRecords);
  const showToast = useToastStore((s) => s.show);

  const record = useMemo(() => records.find((r) => r.id === breedingId), [records, breedingId]);

  // Form state
  const [birthDate, setBirthDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [doesCount, setDoesCount] = useState('0');
  const [bucksCount, setBucksCount] = useState('0');
  const [stillbornCount, setStillbornCount] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Species-specific offspring labels
  const speciesConfig = record ? SPECIES_CONFIG[record.species as SpeciesKey] : undefined;
  const doesLabel = speciesConfig ? `${speciesConfig.offspringTermDoe} (female)` : LABEL_DOES_COUNT;
  const bucksLabel = speciesConfig
    ? `${speciesConfig.offspringTermBuck} (male)`
    : LABEL_BUCKS_COUNT;

  const handleNumericChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (text: string) => {
      // Allow empty string for clearing the field
      if (text === '') {
        setter('');
        return;
      }
      // Only allow digits
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned !== '') {
        setter(cleaned);
      }
    };
  };

  const handleSubmit = useCallback(async () => {
    if (!record || !breedingId) return;

    // Parse numeric values (treat empty as 0)
    const parsedDoes = doesCount === '' ? 0 : parseInt(doesCount, 10);
    const parsedBucks = bucksCount === '' ? 0 : parseInt(bucksCount, 10);
    const parsedStillborn = stillbornCount === '' ? 0 : parseInt(stillbornCount, 10);

    // Validate using Zod schema
    const schema = createBirthFormSchema(record.pairingDate);
    const result = schema.safeParse({
      birthDate,
      doesCount: parsedDoes,
      bucksCount: parsedBucks,
      stillbornCount: parsedStillborn,
      notes: notes || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form';
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      await createBirth({
        breedingRecordId: breedingId,
        birthDate: result.data.birthDate,
        doesCount: result.data.doesCount,
        bucksCount: result.data.bucksCount,
        stillbornCount: result.data.stillbornCount,
        notes: result.data.notes ?? null,
      });
      await fetchRecords();
      showToast(toastBirthLogged(record.animalName));
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save birth record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    record,
    breedingId,
    birthDate,
    doesCount,
    bucksCount,
    stillbornCount,
    notes,
    fetchRecords,
    router,
    showToast,
  ]);

  // Error state: record not found
  if (!record) {
    return (
      <>
        <Stack.Screen options={{ title: 'Log birth' }} />
        <View className="flex-1 bg-parchment items-center justify-center px-4">
          <Text className="font-dm-sans text-base text-dusk text-center">
            Breeding record not found.
          </Text>
        </View>
      </>
    );
  }

  const screenTitle = `Log birth — ${record.animalName}`;

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />
      <ScrollView
        className="flex-1 bg-parchment"
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Birth Date */}
        <Input
          label={LABEL_BIRTH_DATE}
          placeholder="YYYY-MM-DD"
          value={birthDate}
          onChangeText={setBirthDate}
          error={errors.birthDate}
        />

        {/* Offspring Counts */}
        <Text className="font-dm-sans-medium text-[13px] mb-2" style={{ color: COLORS.bark }}>
          Offspring count
        </Text>
        <View className="flex-row gap-3 mb-1">
          <View className="flex-1">
            <Input
              label={doesLabel}
              placeholder="0"
              value={doesCount}
              onChangeText={handleNumericChange(setDoesCount)}
              keyboardType="numeric"
              error={errors.doesCount}
            />
          </View>
          <View className="flex-1">
            <Input
              label={bucksLabel}
              placeholder="0"
              value={bucksCount}
              onChangeText={handleNumericChange(setBucksCount)}
              keyboardType="numeric"
              error={errors.bucksCount}
            />
          </View>
          <View className="flex-1">
            <Input
              label={LABEL_STILLBORN_COUNT}
              placeholder="0"
              value={stillbornCount}
              onChangeText={handleNumericChange(setStillbornCount)}
              keyboardType="numeric"
              error={errors.stillbornCount}
            />
          </View>
        </View>

        {/* Notes */}
        <Input
          label={LABEL_NOTES}
          placeholder={PLACEHOLDER_NOTES}
          value={notes}
          onChangeText={setNotes}
          maxLength={NOTES_MAX_LENGTH}
          multiline
          numberOfLines={4}
          error={errors.notes}
        />
        <Text
          className="font-dm-sans text-[12px] -mt-2 mb-4 text-right"
          style={{ color: COLORS.mist }}
        >
          {notes.length}/{NOTES_MAX_LENGTH}
        </Text>

        {/* Save Button */}
        <Button size="lg" onPress={handleSubmit} disabled={isSubmitting} loading={isSubmitting}>
          {ACTION_SAVE_BIRTH}
        </Button>
      </ScrollView>
    </>
  );
}
