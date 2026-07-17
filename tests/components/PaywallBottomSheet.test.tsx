import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { PaywallBottomSheet } from '@/components/PaywallBottomSheet';
import { APP_NAME } from '@/constants/app';
import {
  PAYWALL_CTA_START_TRIAL,
  PAYWALL_DISMISS,
  PAYWALL_HEADLINE,
  PAYWALL_LOADING,
  PAYWALL_TRIAL_BADGE,
} from '@/constants/strings';

const mockGetOfferings = jest.fn();

// The store reaches RevenueCat through lib/purchases; mock the whole boundary so
// no native module is pulled into the component test.
jest.mock('@/lib/purchases', () => ({
  __esModule: true,
  getOfferings: (...args: unknown[]) => mockGetOfferings(...args),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  getCustomerInfoSafe: jest.fn(),
  isPaidTier: jest.fn(() => false),
}));

const pendingOfferings = () => new Promise(() => {});

const offeringWithAnnual = {
  availablePackages: [
    {
      identifier: 'freshen_annual',
      packageType: 'ANNUAL',
      product: { title: 'Freshen Annual', priceString: '$9.99', introPrice: { periodUnit: 'DAY' } },
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PaywallBottomSheet', () => {
  it('renders the headline built from APP_NAME', () => {
    mockGetOfferings.mockReturnValue(pendingOfferings());
    render(<PaywallBottomSheet visible onClose={jest.fn()} />);
    expect(screen.getByText(PAYWALL_HEADLINE)).toBeTruthy();
    expect(PAYWALL_HEADLINE).toContain(APP_NAME);
  });

  it('shows the loading state while offerings load', () => {
    mockGetOfferings.mockReturnValue(pendingOfferings());
    render(<PaywallBottomSheet visible onClose={jest.fn()} />);
    expect(screen.getByText(PAYWALL_LOADING)).toBeTruthy();
  });

  it('calls onClose when the dismiss link is pressed on a soft paywall', () => {
    mockGetOfferings.mockReturnValue(pendingOfferings());
    const onClose = jest.fn();
    render(<PaywallBottomSheet visible onClose={onClose} />);
    fireEvent.press(screen.getByText(PAYWALL_DISMISS));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the dismiss link on a hard (non-dismissible) paywall', () => {
    mockGetOfferings.mockReturnValue(pendingOfferings());
    render(<PaywallBottomSheet visible dismissible={false} onClose={jest.fn()} />);
    expect(screen.queryByText(PAYWALL_DISMISS)).toBeNull();
  });

  it('renders the package price, trial badge, and CTA once offerings load', async () => {
    mockGetOfferings.mockResolvedValue(offeringWithAnnual);
    render(<PaywallBottomSheet visible onClose={jest.fn()} />);
    expect(await screen.findByText('$9.99')).toBeTruthy();
    expect(screen.getByText(PAYWALL_TRIAL_BADGE)).toBeTruthy();
    expect(screen.getByText(PAYWALL_CTA_START_TRIAL)).toBeTruthy();
  });
});
