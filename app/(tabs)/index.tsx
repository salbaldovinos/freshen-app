import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { BreedingCard } from '@/components/breeding/BreedingCard';
import { Dialog, DialogActions } from '@/components/ui/dialog';
import { Sheet, SheetItem } from '@/components/ui/sheet';
import { Toast } from '@/components/ui/toast';
import { COLORS } from '@/constants/theme';
import {
  EMPTY_STATE_BREEDING_LIST,
  LOADING_ERROR_RECORDS,
  activeBreedingsCount,
  SORT_DUE_DATE_ASC,
  SORT_DUE_DATE_DESC,
  SORT_DATE_ADDED_NEWEST,
  SORT_DATE_ADDED_OLDEST,
  SORT_NAME_AZ,
  ACTION_EDIT_ENTRY,
  ACTION_MARK_PREGNANT,
  ACTION_LOG_BIRTH,
  ACTION_ARCHIVE,
  ACTION_DELETE,
  CONFIRM_DELETE_TITLE,
  CONFIRM_DELETE_MESSAGE,
  TOAST_RECORD_DELETED,
  toastPregnancyConfirmed,
} from '@/constants/strings';
import {
  useBreedingStore,
  type BreedingRecordWithComputed,
  type SortOption,
} from '@/store/useBreedingStore';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: SORT_DUE_DATE_ASC, value: 'due_date_asc' },
  { label: SORT_DUE_DATE_DESC, value: 'due_date_desc' },
  { label: SORT_DATE_ADDED_NEWEST, value: 'date_added_newest' },
  { label: SORT_DATE_ADDED_OLDEST, value: 'date_added_oldest' },
  { label: SORT_NAME_AZ, value: 'name_az' },
];

const SKELETON_ITEMS = [1, 2, 3] as const;

function SkeletonCard() {
  return <View className="mx-4 mb-3 rounded-xl bg-fog" style={{ height: 140 }} />;
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    records,
    isLoading,
    error,
    sortOption,
    fetchRecords,
    setSortOption,
    deleteRecord,
    archiveRecord,
    confirmPregnancy,
  } = useBreedingStore();

  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BreedingRecordWithComputed | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void fetchRecords();
  }, [fetchRecords]);

  const activeCount = useMemo(
    () => records.filter((r) => r.status !== 'archived').length,
    [records],
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  }, [fetchRecords]);

  const handleLongPress = useCallback((record: BreedingRecordWithComputed) => {
    setSelectedRecord(record);
    setActionSheetVisible(true);
  }, []);

  const closeActionSheet = useCallback(() => {
    setActionSheetVisible(false);
    setSelectedRecord(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedRecord) return;
    closeActionSheet();
    router.push({
      pathname: '/(tabs)/add',
      params: { id: selectedRecord.id },
    });
  }, [selectedRecord, closeActionSheet, router]);

  const handleMarkPregnant = useCallback(async () => {
    if (!selectedRecord) return;
    const name = selectedRecord.animalName;
    closeActionSheet();
    await confirmPregnancy(selectedRecord.id);
    showToast(toastPregnancyConfirmed(name));
  }, [selectedRecord, closeActionSheet, confirmPregnancy, showToast]);

  const handleLogBirth = useCallback(() => {
    if (!selectedRecord) return;
    closeActionSheet();
    router.push({
      pathname: '/birth/[breedingId]',
      params: { breedingId: selectedRecord.id },
    });
  }, [selectedRecord, closeActionSheet, router]);

  const handleArchive = useCallback(async () => {
    if (!selectedRecord) return;
    closeActionSheet();
    await archiveRecord(selectedRecord.id);
  }, [selectedRecord, closeActionSheet, archiveRecord]);

  const handleDeleteConfirm = useCallback(() => {
    closeActionSheet();
    setDeleteDialogVisible(true);
  }, [closeActionSheet]);

  const handleDeleteExecute = useCallback(async () => {
    if (!selectedRecord) return;
    setDeleteDialogVisible(false);
    await deleteRecord(selectedRecord.id);
    setSelectedRecord(null);
    showToast(TOAST_RECORD_DELETED);
  }, [selectedRecord, deleteRecord, showToast]);

  const handleSortSelect = useCallback(
    (option: SortOption) => {
      void setSortOption(option);
      setSortSheetVisible(false);
    },
    [setSortOption],
  );

  const renderItem = useCallback(
    ({ item }: { item: BreedingRecordWithComputed }) => (
      <View className="mx-4 mb-3">
        <BreedingCard
          record={item}
          onPress={() => router.push(`/breeding/${item.id}`)}
          onLongPress={() => handleLongPress(item)}
        />
      </View>
    ),
    [router, handleLongPress],
  );

  const keyExtractor = useCallback((item: BreedingRecordWithComputed) => item.id, []);

  // Loading state — first load with no records
  if (isLoading && records.length === 0) {
    return (
      <View className="flex-1 bg-parchment pt-4">
        {SKELETON_ITEMS.map((key) => (
          <SkeletonCard key={key} />
        ))}
      </View>
    );
  }

  // Error state
  if (error && records.length === 0) {
    return (
      <View className="flex-1 bg-parchment">
        <FlatList
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.ember}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 pt-40">
              <Text className="font-dm-sans text-base text-dusk text-center">
                {LOADING_ERROR_RECORDS}
              </Text>
            </View>
          }
        />
      </View>
    );
  }

  // Empty state
  if (records.length === 0) {
    return (
      <View className="flex-1 bg-parchment items-center justify-center px-6">
        <Text className="font-dm-sans text-base text-dusk text-center">
          {EMPTY_STATE_BREEDING_LIST}
        </Text>

        {/* FAB */}
        <Pressable
          className="absolute bottom-5 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{ backgroundColor: COLORS.ember }}
          onPress={() => router.push('/(tabs)/add')}
        >
          <Text className="font-dm-sans-semibold text-2xl text-white" style={{ marginTop: -2 }}>
            +
          </Text>
        </Pressable>
      </View>
    );
  }

  // Populated state
  return (
    <View className="flex-1 bg-parchment">
      {/* Header row */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <Text className="font-dm-sans text-sm text-dusk">{activeBreedingsCount(activeCount)}</Text>
        <Pressable className="px-2 py-1" onPress={() => setSortSheetVisible(true)}>
          <Text className="font-dm-sans-medium text-sm" style={{ color: COLORS.ember }}>
            Sort
          </Text>
        </Pressable>
      </View>

      {/* Record list */}
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.ember}
          />
        }
      />

      {/* FAB */}
      <Pressable
        className="absolute bottom-5 right-5 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{ backgroundColor: COLORS.ember }}
        onPress={() => router.push('/(tabs)/add')}
      >
        <Text className="font-dm-sans-semibold text-2xl text-white" style={{ marginTop: -2 }}>
          +
        </Text>
      </Pressable>

      {/* Sort bottom sheet */}
      <Sheet visible={sortSheetVisible} onClose={() => setSortSheetVisible(false)} title="Sort by">
        {SORT_OPTIONS.map((opt) => (
          <SheetItem
            key={opt.value}
            label={opt.label}
            onPress={() => handleSortSelect(opt.value)}
            className={sortOption === opt.value ? 'bg-emberPale rounded-lg' : ''}
          />
        ))}
      </Sheet>

      {/* Long-press action sheet */}
      <Sheet
        visible={actionSheetVisible}
        onClose={closeActionSheet}
        title={selectedRecord?.animalName}
      >
        <SheetItem label={ACTION_EDIT_ENTRY} onPress={handleEdit} />

        {selectedRecord?.status === 'bred' && (
          <SheetItem label={ACTION_MARK_PREGNANT} onPress={handleMarkPregnant} />
        )}

        {selectedRecord &&
          selectedRecord.status !== 'birth_logged' &&
          selectedRecord.status !== 'archived' && (
            <SheetItem label={ACTION_LOG_BIRTH} onPress={handleLogBirth} />
          )}

        {selectedRecord && !selectedRecord.archived && !selectedRecord.hasBirth && (
          <SheetItem label={ACTION_ARCHIVE} onPress={handleArchive} />
        )}

        <SheetItem label={ACTION_DELETE} onPress={handleDeleteConfirm} destructive />
      </Sheet>

      {/* Delete confirmation dialog */}
      <Dialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        title={CONFIRM_DELETE_TITLE}
        description={CONFIRM_DELETE_MESSAGE}
      >
        <DialogActions>
          <Pressable className="px-4 py-2 rounded-lg" onPress={() => setDeleteDialogVisible(false)}>
            <Text className="font-dm-sans-medium text-sm text-dusk">Cancel</Text>
          </Pressable>
          <Pressable
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: COLORS.destructive }}
            onPress={handleDeleteExecute}
          >
            <Text className="font-dm-sans-medium text-sm text-white">Delete</Text>
          </Pressable>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </View>
  );
}
