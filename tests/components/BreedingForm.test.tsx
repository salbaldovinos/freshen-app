import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { BreedingForm } from '@/components/breeding/BreedingForm';
import {
  ERROR_ANIMAL_NAME_MAX,
  ERROR_ANIMAL_NAME_REQUIRED,
  PLACEHOLDER_ANIMAL_NAME,
  PLACEHOLDER_NOTES,
} from '@/constants/strings';

describe('BreedingForm', () => {
  it('shows required error and does not submit when animal name is empty', () => {
    const onSubmit = jest.fn();
    render(<BreedingForm onSubmit={onSubmit} submitLabel="Save" />);

    fireEvent.press(screen.getByText('Save'));

    expect(screen.getByText(ERROR_ANIMAL_NAME_REQUIRED)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows max-length error for a 51-character animal name', () => {
    const onSubmit = jest.fn();
    render(<BreedingForm onSubmit={onSubmit} submitLabel="Save" />);

    fireEvent.changeText(screen.getByPlaceholderText(PLACEHOLDER_ANIMAL_NAME), 'x'.repeat(51));
    fireEvent.press(screen.getByText('Save'));

    expect(screen.getByText(ERROR_ANIMAL_NAME_MAX)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('clears the field error once the user edits the field', () => {
    render(<BreedingForm onSubmit={jest.fn()} submitLabel="Save" />);

    fireEvent.press(screen.getByText('Save'));
    expect(screen.getByText(ERROR_ANIMAL_NAME_REQUIRED)).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText(PLACEHOLDER_ANIMAL_NAME), 'D');
    expect(screen.queryByText(ERROR_ANIMAL_NAME_REQUIRED)).toBeNull();
  });

  it('updates the notes character counter as the user types', () => {
    render(<BreedingForm onSubmit={jest.fn()} submitLabel="Save" />);

    expect(screen.getByText('0/500')).toBeTruthy();
    fireEvent.changeText(screen.getByPlaceholderText(PLACEHOLDER_NOTES), 'hello');
    expect(screen.getByText('5/500')).toBeTruthy();
  });

  it('submits parsed data with goat defaults when valid', () => {
    const onSubmit = jest.fn();
    render(<BreedingForm onSubmit={onSubmit} submitLabel="Save" />);

    fireEvent.changeText(screen.getByPlaceholderText(PLACEHOLDER_ANIMAL_NAME), 'Daisy');
    fireEvent.press(screen.getByText('Save'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        animalName: 'Daisy',
        species: 'goat',
        gestationDays: 150,
        color: 'gray',
      }),
    );
  });

  it('shows the live due date preview for the default goat gestation', () => {
    render(<BreedingForm onSubmit={jest.fn()} submitLabel="Save" />);
    expect(screen.getByText(/Estimated due date:/)).toBeTruthy();
  });
});
