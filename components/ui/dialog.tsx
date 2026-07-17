import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { cn } from '@/lib/utils';

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Dialog({ visible, onClose, title, description, children }: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 items-center justify-center px-6" onPress={onClose}>
        <Pressable className="w-full bg-white rounded-xl p-6" onPress={(e) => e.stopPropagation()}>
          <Text className="font-cormorant-medium text-xl text-bark mb-1">{title}</Text>
          {description && (
            <Text className="font-dm-sans text-sm text-dusk mb-4">{description}</Text>
          )}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export interface DialogActionsProps {
  className?: string;
  children: React.ReactNode;
}

export function DialogActions({ className, children }: DialogActionsProps) {
  return <View className={cn('flex-row justify-end gap-3 mt-4', className)}>{children}</View>;
}
