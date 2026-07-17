import React from 'react';

import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/constants/theme';
import type { BreedingStatus } from '@/lib/gestation';

export interface GestationBadgeProps {
  status: BreedingStatus;
}

const STATUS_DISPLAY_TEXT: Record<BreedingStatus, string> = {
  bred: 'BRED',
  pregnant: 'PREGNANT',
  overdue: 'OVERDUE',
  birth_logged: 'BIRTH LOGGED',
  archived: 'ARCHIVED',
};

const STATUS_COLOR_KEY: Record<BreedingStatus, keyof typeof STATUS_COLORS> = {
  bred: 'bred',
  pregnant: 'pregnant',
  overdue: 'overdue',
  birth_logged: 'birthLogged',
  archived: 'archived',
};

export function GestationBadge({ status }: GestationBadgeProps) {
  const colorKey = STATUS_COLOR_KEY[status];
  const colors = STATUS_COLORS[colorKey];

  return (
    <Badge
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {STATUS_DISPLAY_TEXT[status]}
    </Badge>
  );
}
