import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
  style?: {
    backgroundColor?: string;
    color?: string;
  };
}

export function Badge({ className, textClassName, children, style }: BadgeProps) {
  return (
    <View
      className={cn('rounded-full px-[10px] py-1', className)}
      style={style?.backgroundColor ? { backgroundColor: style.backgroundColor } : undefined}
    >
      {typeof children === 'string' ? (
        <Text
          className={cn('font-dm-sans-medium text-[11px] uppercase tracking-wider', textClassName)}
          style={style?.color ? { color: style.color } : undefined}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
