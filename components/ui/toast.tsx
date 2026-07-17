import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { cn } from '@/lib/utils';

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
  className?: string;
}

export function Toast({ message, visible, onDismiss, duration = 2500, className }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }
  }, [visible, duration, onDismiss, opacity]);

  if (!visible) return null;

  return (
    <Animated.View
      className={cn('absolute bottom-12 left-4 right-4 rounded-lg bg-bark px-4 py-3', className)}
      style={{ opacity }}
    >
      <Text className="font-dm-sans text-sm text-white text-center">{message}</Text>
    </Animated.View>
  );
}
