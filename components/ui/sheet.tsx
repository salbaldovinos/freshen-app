import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ visible, onClose, title, children, className }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Wrapper pressables are not semantic buttons — without accessible={false},
          iOS flattens the whole sheet into one element, hiding items from
          VoiceOver and UI tests. */}
      <Pressable accessible={false} className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          accessible={false}
          className={cn('bg-white rounded-t-xl', className)}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <View className="px-4 py-3 border-b border-flax">
              <Text className="font-dm-sans-medium text-base text-bark text-center">{title}</Text>
            </View>
          )}
          <View className="px-4 py-2">{children}</View>
          <View className="h-8" />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export interface SheetItemProps {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SheetItem({ label, onPress, destructive, disabled, className }: SheetItemProps) {
  return (
    <Pressable
      className={cn('py-3 px-2', disabled && 'opacity-40', className)}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={cn('font-dm-sans text-base', destructive ? 'text-[#B34030]' : 'text-bark')}>
        {label}
      </Text>
    </Pressable>
  );
}
