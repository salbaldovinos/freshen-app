import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { cn } from '@/lib/utils';

export interface InputProps {
  className?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  maxLength?: number;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  className,
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType,
  maxLength,
  editable = true,
  multiline,
  numberOfLines,
}: InputProps) {
  return (
    <View className={cn('mb-4', className)}>
      {label && <Text className="font-dm-sans-medium text-[13px] text-bark mb-1.5">{label}</Text>}
      <TextInput
        className={cn(
          'rounded-md border bg-white px-3 py-2.5 font-dm-sans text-sm text-bark',
          error ? 'border-[1.5px] border-[#B34030]' : 'border-sand',
        )}
        placeholder={placeholder}
        placeholderTextColor="#B8A898"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={
          multiline
            ? { textAlignVertical: 'top', minHeight: numberOfLines ? numberOfLines * 24 : 80 }
            : undefined
        }
      />
      {error && <Text className="font-dm-sans text-[13px] text-[#9E3A28] mt-1">{error}</Text>}
    </View>
  );
}
