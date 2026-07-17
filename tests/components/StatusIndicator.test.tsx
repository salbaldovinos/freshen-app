import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { StatusIndicator } from '@/components/breeding/StatusIndicator';
import {
  SYNC_OFFLINE_MESSAGE,
  SYNC_SHEET_TITLE,
  SYNC_STATUS_OFFLINE,
  SYNC_STATUS_SYNCED,
  SYNC_STATUS_SYNCING,
} from '@/constants/strings';

describe('StatusIndicator', () => {
  it('renders the synced state', () => {
    render(<StatusIndicator status="synced" lastSyncedAt={new Date()} />);
    expect(screen.getByText(SYNC_STATUS_SYNCED)).toBeTruthy();
    expect(screen.getByLabelText(`Sync status: ${SYNC_STATUS_SYNCED}`)).toBeTruthy();
  });

  it('renders the syncing state', () => {
    render(<StatusIndicator status="syncing" />);
    expect(screen.getByText(SYNC_STATUS_SYNCING)).toBeTruthy();
    expect(screen.getByLabelText(`Sync status: ${SYNC_STATUS_SYNCING}`)).toBeTruthy();
  });

  it('renders the offline state', () => {
    render(<StatusIndicator status="offline" />);
    expect(screen.getByText(SYNC_STATUS_OFFLINE)).toBeTruthy();
    expect(screen.getByLabelText(`Sync status: ${SYNC_STATUS_OFFLINE}`)).toBeTruthy();
  });

  it('opens the sheet with the last-sync time when tapped', () => {
    render(<StatusIndicator status="synced" lastSyncedAt={new Date(Date.now() - 60_000)} />);
    fireEvent.press(screen.getByLabelText(`Sync status: ${SYNC_STATUS_SYNCED}`));
    expect(screen.getByText(SYNC_SHEET_TITLE)).toBeTruthy();
    expect(screen.getByText(/Last synced/)).toBeTruthy();
  });

  it('opens the sheet with the offline message when offline', () => {
    render(<StatusIndicator status="offline" />);
    fireEvent.press(screen.getByLabelText(`Sync status: ${SYNC_STATUS_OFFLINE}`));
    expect(screen.getByText(SYNC_SHEET_TITLE)).toBeTruthy();
    expect(screen.getByText(SYNC_OFFLINE_MESSAGE)).toBeTruthy();
  });
});
