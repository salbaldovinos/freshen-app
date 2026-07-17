import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { format, parseISO } from 'date-fns';
import { z } from 'zod';

import { Input } from '@/components/ui/input';
import { Select, type SelectOption } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SPECIES_CONFIG, type SpeciesKey } from '@/constants/species';
import {
  LABEL_ANIMAL_NAME,
  LABEL_SIRE_NAME,
  LABEL_PAIRING_DATE,
  LABEL_SPECIES,
  LABEL_GESTATION_DAYS,
  LABEL_NOTES,
  LABEL_COLOR_TAG,
  PLACEHOLDER_ANIMAL_NAME,
  PLACEHOLDER_SIRE_NAME,
  PLACEHOLDER_NOTES,
  TIER_SPECIES_PREMIUM_BADGE,
} from '@/constants/strings';
import { COLOR_TAGS, type ColorTagValue } from '@/constants/theme';
import { calculateDueDate } from '@/lib/gestation';
import { breedingFormSchema, type BreedingFormData } from '@/lib/schemas';
import { canAccessSpecies, type Tier } from '@/lib/tierChecks';

// --- Types ---

interface BreedingFormProps {
  initialData?: BreedingFormData;
  onSubmit: (data: BreedingFormData) => void;
  isSubmitting?: boolean;
  submitLabel: string;
  /** Current tier — decides which species are locked. Defaults to free. */
  tier?: Tier;
  /** Called when a tier-locked species is tapped, so the caller can open the paywall. */
  onLockedSpeciesPress?: () => void;
}

// --- Helpers ---

function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function isValidISODate(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  try {
    const parsed = parseISO(val);
    return !isNaN(parsed.getTime());
  } catch {
    return false;
  }
}

type FieldErrors = Partial<Record<keyof BreedingFormData, string>>;

// --- Component ---

export function BreedingForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  tier = 'free',
  onLockedSpeciesPress,
}: BreedingFormProps) {
  // Locked species stay selectable so their tap can open the paywall; the badge
  // in the label communicates the lock (the do-not-edit Select can't render one).
  const speciesOptions: SelectOption[] = useMemo(
    () =>
      Object.entries(SPECIES_CONFIG).map(([key, config]) => {
        const locked = !canAccessSpecies(key as SpeciesKey, tier);
        return {
          label: locked ? `${config.label} · ${TIER_SPECIES_PREMIUM_BADGE}` : config.label,
          value: key,
        };
      }),
    [tier],
  );

  const defaultSpecies: SpeciesKey = initialData?.species ?? 'goat';
  const defaultGestation =
    initialData?.gestationDays ?? SPECIES_CONFIG[defaultSpecies].gestationDays;

  const [animalName, setAnimalName] = useState(initialData?.animalName ?? '');
  const [sireName, setSireName] = useState(initialData?.sireName ?? '');
  const [pairingDate, setPairingDate] = useState(initialData?.pairingDate ?? getTodayISO());
  const [species, setSpecies] = useState<SpeciesKey>(defaultSpecies);
  const [gestationDays, setGestationDays] = useState(String(defaultGestation));
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [color, setColor] = useState<ColorTagValue>(initialData?.color ?? 'gray');
  const [errors, setErrors] = useState<FieldErrors>({});

  // Track whether the user has manually edited gestation days
  const gestationManuallyEdited = useRef(false);

  // --- Due date preview ---

  const gestationNum = parseInt(gestationDays, 10);
  const showDueDate =
    isValidISODate(pairingDate) && !isNaN(gestationNum) && gestationNum >= 1 && gestationNum <= 400;

  const dueDatePreview = showDueDate
    ? format(parseISO(calculateDueDate(pairingDate, gestationNum)), 'MMMM d, yyyy')
    : null;

  // --- Species change handler ---

  const handleSpeciesChange = useCallback(
    (newSpecies: string) => {
      const speciesKey = newSpecies as SpeciesKey;

      // Tapping a tier-locked species opens the paywall and leaves selection unchanged.
      if (!canAccessSpecies(speciesKey, tier)) {
        onLockedSpeciesPress?.();
        return;
      }

      const newDefault = SPECIES_CONFIG[speciesKey].gestationDays;

      setSpecies(speciesKey);

      if (!gestationManuallyEdited.current) {
        setGestationDays(String(newDefault));
        return;
      }

      const currentVal = parseInt(gestationDays, 10);
      if (currentVal === newDefault) {
        return;
      }

      Alert.alert(
        'Update gestation days',
        `Update gestation days to ${newDefault} for ${SPECIES_CONFIG[speciesKey].label}?`,
        [
          {
            text: `Keep ${currentVal}`,
            style: 'cancel',
          },
          {
            text: 'Update',
            onPress: () => {
              setGestationDays(String(newDefault));
              gestationManuallyEdited.current = false;
            },
          },
        ],
      );
    },
    [gestationDays, tier, onLockedSpeciesPress],
  );

  // --- Gestation days change handler ---

  const handleGestationChange = useCallback(
    (val: string) => {
      setGestationDays(val);
      const speciesDefault = SPECIES_CONFIG[species].gestationDays;
      if (parseInt(val, 10) !== speciesDefault) {
        gestationManuallyEdited.current = true;
      }
    },
    [species],
  );

  // --- Submit ---

  const handleSubmit = useCallback(() => {
    const formData = {
      animalName: animalName.trim(),
      sireName: sireName.trim() || undefined,
      pairingDate,
      species,
      gestationDays: parseInt(gestationDays, 10) || 0,
      notes: notes.trim() || undefined,
      color,
    };

    const result = breedingFormSchema.safeParse(formData);

    if (!result.success) {
      const flattened = z.flattenError(result.error);
      const fieldErrs: FieldErrors = {};
      for (const [key, messages] of Object.entries(flattened.fieldErrors)) {
        const msgs = messages as string[];
        if (msgs.length > 0) {
          fieldErrs[key as keyof BreedingFormData] = msgs[0];
        }
      }
      setErrors(fieldErrs);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  }, [animalName, sireName, pairingDate, species, gestationDays, notes, color, onSubmit]);

  // --- Render ---

  return (
    <View>
      {/* Animal Name */}
      <Input
        label={LABEL_ANIMAL_NAME}
        placeholder={PLACEHOLDER_ANIMAL_NAME}
        value={animalName}
        onChangeText={(val) => {
          setAnimalName(val);
          if (errors.animalName) setErrors((prev) => ({ ...prev, animalName: undefined }));
        }}
        maxLength={50}
        error={errors.animalName}
      />

      {/* Sire Name */}
      <Input
        label={LABEL_SIRE_NAME}
        placeholder={PLACEHOLDER_SIRE_NAME}
        value={sireName}
        onChangeText={(val) => {
          setSireName(val);
          if (errors.sireName) setErrors((prev) => ({ ...prev, sireName: undefined }));
        }}
        maxLength={50}
        error={errors.sireName}
      />

      {/* Pairing Date */}
      <Input
        label={LABEL_PAIRING_DATE}
        placeholder="YYYY-MM-DD"
        value={pairingDate}
        onChangeText={(val) => {
          setPairingDate(val);
          if (errors.pairingDate) setErrors((prev) => ({ ...prev, pairingDate: undefined }));
        }}
        error={errors.pairingDate}
      />

      {/* Species */}
      <Select
        label={LABEL_SPECIES}
        value={species}
        options={speciesOptions}
        onValueChange={handleSpeciesChange}
        error={errors.species}
      />

      {/* Gestation Days */}
      <Input
        label={LABEL_GESTATION_DAYS}
        value={gestationDays}
        onChangeText={(val) => {
          handleGestationChange(val);
          if (errors.gestationDays) setErrors((prev) => ({ ...prev, gestationDays: undefined }));
        }}
        keyboardType="numeric"
        error={errors.gestationDays}
      />

      {/* Due date preview */}
      {dueDatePreview && (
        <View className="mb-4 -mt-2">
          <Text className="font-dm-sans text-sm text-dusk">
            Estimated due date: {dueDatePreview}
          </Text>
        </View>
      )}

      {/* Notes */}
      <View>
        <Input
          label={LABEL_NOTES}
          placeholder={PLACEHOLDER_NOTES}
          value={notes}
          onChangeText={(val) => {
            setNotes(val);
            if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
          }}
          maxLength={500}
          multiline
          numberOfLines={4}
          error={errors.notes}
        />
        <View className="-mt-3 mb-4">
          <Text className="font-dm-sans text-[11px] text-mist text-right">{notes.length}/500</Text>
        </View>
      </View>

      {/* Color Tag */}
      <View className="mb-6">
        <Text className="font-dm-sans-medium text-[13px] text-bark mb-2">{LABEL_COLOR_TAG}</Text>
        <View className="flex-row gap-3">
          {COLOR_TAGS.map((tag) => (
            <Pressable key={tag.value} onPress={() => setColor(tag.value)} className="items-center">
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: tag.hex,
                  borderWidth: color === tag.value ? 3 : 0,
                  borderColor: '#261C10',
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Submit */}
      <Button onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} size="lg">
        {submitLabel}
      </Button>
    </View>
  );
}
