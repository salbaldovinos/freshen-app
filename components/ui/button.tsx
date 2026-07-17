import React from 'react';
import { Pressable, Text, ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('flex-row items-center justify-center rounded-md', {
  variants: {
    variant: {
      default: 'bg-ember',
      secondary: 'border-[1.5px] border-ember bg-transparent',
      ghost: 'border border-sand bg-transparent',
      destructive: 'border-[1.5px] border-[#EAC0BB] bg-transparent',
    },
    size: {
      default: 'px-[18px] py-[9px]',
      sm: 'px-3 py-1.5',
      lg: 'px-6 py-3',
      full: 'px-6 py-3 rounded-full',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = cva('font-dm-sans-medium text-sm', {
  variants: {
    variant: {
      default: 'text-white',
      secondary: 'text-ember',
      ghost: 'text-dusk',
      destructive: 'text-[#B34030]',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ButtonProps extends VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  className,
  textClassName,
  variant,
  size,
  onPress,
  disabled,
  loading,
  children,
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size }), disabled && 'opacity-50', className)}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || !variant ? '#FFFFFF' : '#C4603A'}
        />
      ) : typeof children === 'string' ? (
        <Text className={cn(buttonTextVariants({ variant }), textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
