import React from 'react';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <View
      className={cn('rounded-lg border border-flax bg-white', className)}
      style={{
        shadowColor: '#261C10',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

export function CardHeader({ className, children }: CardProps) {
  return <View className={cn('px-[18px] pt-4', className)}>{children}</View>;
}

export function CardContent({ className, children }: CardProps) {
  return <View className={cn('px-[18px] pb-[18px]', className)}>{children}</View>;
}

export function CardFooter({ className, children }: CardProps) {
  return <View className={cn('flex-row items-center px-[18px] pb-4', className)}>{children}</View>;
}
