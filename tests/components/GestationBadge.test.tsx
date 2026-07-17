import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { GestationBadge } from '@/components/breeding/GestationBadge';
import type { BreedingStatus } from '@/lib/gestation';

const CASES: [BreedingStatus, string][] = [
  ['bred', 'BRED'],
  ['pregnant', 'PREGNANT'],
  ['overdue', 'OVERDUE'],
  ['birth_logged', 'BIRTH LOGGED'],
  ['archived', 'ARCHIVED'],
];

describe('GestationBadge', () => {
  it.each(CASES)('renders the %s status label', (status, label) => {
    render(<GestationBadge status={status} />);
    expect(screen.getByText(label)).toBeTruthy();
  });

  it.each(CASES)('renders only one label for %s status', (status, label) => {
    render(<GestationBadge status={status} />);
    expect(screen.getAllByText(label)).toHaveLength(1);
  });
});
