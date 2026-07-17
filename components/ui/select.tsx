import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList } from 'react-native';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  className?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  error?: string;
}

export function Select({
  className,
  label,
  placeholder,
  value,
  options,
  onValueChange,
  error,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View className={cn('mb-4', className)}>
      {label && <Text className="font-dm-sans-medium text-[13px] text-bark mb-1.5">{label}</Text>}
      <Pressable
        className={cn(
          'rounded-md border bg-white px-3 py-2.5 flex-row items-center justify-between',
          error ? 'border-[1.5px] border-[#B34030]' : 'border-sand',
        )}
        onPress={() => setOpen(true)}
      >
        <Text className={cn('font-dm-sans text-sm', selectedOption ? 'text-bark' : 'text-mist')}>
          {selectedOption?.label ?? placeholder ?? 'Select...'}
        </Text>
      </Pressable>
      {error && <Text className="font-dm-sans text-[13px] text-[#9E3A28] mt-1">{error}</Text>}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40 justify-end" onPress={() => setOpen(false)}>
          <View className="bg-white rounded-t-xl max-h-[50%]">
            <View className="px-4 py-3 border-b border-flax">
              <Text className="font-dm-sans-medium text-base text-bark text-center">
                {label ?? 'Select'}
              </Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className={cn(
                    'px-4 py-3 border-b border-flax',
                    item.disabled && 'opacity-40',
                    item.value === value && 'bg-parchment',
                  )}
                  onPress={() => {
                    if (!item.disabled) {
                      onValueChange?.(item.value);
                      setOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                >
                  <Text className="font-dm-sans text-sm text-bark">{item.label}</Text>
                  {item.disabled && (
                    <Text className="font-dm-sans text-[11px] text-mist mt-0.5">Coming soon</Text>
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
