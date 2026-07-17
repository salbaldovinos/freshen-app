import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { BreedingDetail } from '@/components/breeding/BreedingDetail';
import { Button } from '@/components/ui/button';
import { COLORS } from '@/constants/theme';
import { useBreedingStore, type BreedingRecordWithComputed } from '@/store/useBreedingStore';

export default function BreedingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const records = useBreedingStore((s) => s.records);
  const isLoading = useBreedingStore((s) => s.isLoading);

  const [record, setRecord] = useState<BreedingRecordWithComputed | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }

    const found = records.find((r) => r.id === id);
    if (found) {
      setRecord(found);
      setNotFound(false);
    } else if (!isLoading) {
      // Records have loaded but this ID wasn't found
      setNotFound(true);
    }
  }, [id, records, isLoading]);

  // Loading state
  if (isLoading && !record) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <View className="flex-1 items-center justify-center bg-parchment">
          <Text className="font-dm-sans text-[14px]" style={{ color: COLORS.mist }}>
            Loading...
          </Text>
        </View>
      </>
    );
  }

  // Not found / deleted externally
  if (notFound || !record) {
    return (
      <>
        <Stack.Screen options={{ title: '' }} />
        <View className="flex-1 items-center justify-center bg-parchment px-6">
          <Text className="font-dm-sans text-[15px] text-center" style={{ color: COLORS.dusk }}>
            This record no longer exists.
          </Text>
          <View className="mt-4">
            <Button variant="secondary" onPress={() => router.back()}>
              Go back
            </Button>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: record.animalName,
          headerRight: () => (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push(`/(tabs)/add?id=${record.id}`)}
            >
              Edit
            </Button>
          ),
        }}
      />
      <BreedingDetail record={record} />
    </>
  );
}
