import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { BreedingCard } from '@/components/breeding/BreedingCard';
import { SIRE_UNKNOWN } from '@/constants/strings';
import type { BreedingRecordWithComputed } from '@/store/useBreedingStore';

function makeRecord(
  overrides: Partial<BreedingRecordWithComputed> = {},
): BreedingRecordWithComputed {
  return {
    id: 'rec-1',
    animalName: 'Daisy',
    sireName: 'Buck',
    pairingDate: '2026-03-01',
    species: 'goat',
    gestationDays: 150,
    notes: null,
    color: 'gray',
    photoUrl: null,
    confirmedPregnant: false,
    archived: false,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
    dueDate: '2026-07-29',
    daysBred: 100,
    daysRemaining: 12,
    status: 'bred',
    hasBirth: false,
    ...overrides,
  };
}

const noop = () => {};

const BADGE_BY_STATUS: [BreedingRecordWithComputed['status'], string][] = [
  ['bred', 'BRED'],
  ['pregnant', 'PREGNANT'],
  ['overdue', 'OVERDUE'],
  ['birth_logged', 'BIRTH LOGGED'],
  ['archived', 'ARCHIVED'],
];

describe('BreedingCard', () => {
  it.each(BADGE_BY_STATUS)('renders the %s status badge', (status, label) => {
    render(<BreedingCard record={makeRecord({ status })} onPress={noop} onLongPress={noop} />);
    // For overdue, the label appears in both banner and badge — presence is what matters
    expect(screen.getAllByText(new RegExp(label)).length).toBeGreaterThanOrEqual(1);
  });

  it('shows the overdue banner only for overdue records', () => {
    render(
      <BreedingCard
        record={makeRecord({ status: 'overdue', daysRemaining: -5 })}
        onPress={noop}
        onLongPress={noop}
      />,
    );
    expect(screen.getByText('OVERDUE — 5 days past due')).toBeTruthy();
  });

  it('uses singular "day" when 1 day past due', () => {
    render(
      <BreedingCard
        record={makeRecord({ status: 'overdue', daysRemaining: -1 })}
        onPress={noop}
        onLongPress={noop}
      />,
    );
    expect(screen.getByText('OVERDUE — 1 day past due')).toBeTruthy();
  });

  it('hides the overdue banner for non-overdue records', () => {
    render(<BreedingCard record={makeRecord()} onPress={noop} onLongPress={noop} />);
    expect(screen.queryByText(/past due/)).toBeNull();
  });

  it('renders animal name, sire, days bred, and formatted due date', () => {
    render(<BreedingCard record={makeRecord()} onPress={noop} onLongPress={noop} />);
    expect(screen.getByText('Daisy')).toBeTruthy();
    expect(screen.getByText('× Buck')).toBeTruthy();
    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText('Jul 29')).toBeTruthy();
  });

  it('falls back to "Sire unknown" when sire is not set', () => {
    render(
      <BreedingCard record={makeRecord({ sireName: null })} onPress={noop} onLongPress={noop} />,
    );
    expect(screen.getByText(SIRE_UNKNOWN)).toBeTruthy();
  });

  it('clamps negative days remaining to 0 in the stats row', () => {
    render(
      <BreedingCard
        record={makeRecord({ status: 'overdue', daysRemaining: -5 })}
        onPress={noop}
        onLongPress={noop}
      />,
    );
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('fires onPress and onLongPress', () => {
    const onPress = jest.fn();
    const onLongPress = jest.fn();
    render(<BreedingCard record={makeRecord()} onPress={onPress} onLongPress={onLongPress} />);
    fireEvent.press(screen.getByText('Daisy'));
    fireEvent(screen.getByText('Daisy'), 'longPress');
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
