import type * as AnalyticsModule from '@/lib/analytics';

const mockCapture = jest.fn();
const mockIdentify = jest.fn();
const mockReset = jest.fn();
const mockConstructor = jest.fn();

// babel-preset-expo rewrites `process.env.EXPO_PUBLIC_*` reads to a named import
// from 'expo/virtual/env'. The real module is `export const env = process.env`;
// this mock mirrors it so the test's process.env mutations flow through.
jest.mock('expo/virtual/env', () => ({ __esModule: true, env: process.env }));

jest.mock('posthog-react-native', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((apiKey: string) => {
    mockConstructor(apiKey);
    return { capture: mockCapture, identify: mockIdentify, reset: mockReset };
  }),
}));

// __DEV__ is a readonly RN global; go through globalThis to flip it per test.
const setDevMode = (value: boolean): void => {
  (globalThis as unknown as { __DEV__: boolean }).__DEV__ = value;
};

// Fresh module registry per call so the module-level `client` singleton resets.
const loadAnalytics = (): typeof AnalyticsModule => {
  jest.resetModules();
  return jest.requireActual('@/lib/analytics') as typeof AnalyticsModule;
};

beforeEach(() => {
  jest.clearAllMocks();
  setDevMode(false);
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY = 'phc_test_key';
});

afterEach(() => {
  delete process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
});

describe('initializeAnalytics', () => {
  it('constructs the PostHog client with the API key in production', () => {
    const analytics = loadAnalytics();
    analytics.initializeAnalytics();
    expect(mockConstructor).toHaveBeenCalledTimes(1);
    expect(mockConstructor).toHaveBeenCalledWith('phc_test_key');
  });

  it('no-ops (never throws) when the API key is missing', () => {
    delete process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
    const analytics = loadAnalytics();
    expect(() => analytics.initializeAnalytics()).not.toThrow();
    expect(mockConstructor).not.toHaveBeenCalled();
  });

  it('no-ops (never throws) in development', () => {
    setDevMode(true);
    const analytics = loadAnalytics();
    expect(() => analytics.initializeAnalytics()).not.toThrow();
    expect(mockConstructor).not.toHaveBeenCalled();
  });
});

describe('track', () => {
  it('is safe before init and does not capture', () => {
    const analytics = loadAnalytics();
    expect(() => analytics.track('breeding_record_created')).not.toThrow();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('forwards the event and properties after init', () => {
    const analytics = loadAnalytics();
    analytics.initializeAnalytics();
    analytics.track('birth_logged', { offspring_count: 2, live: true });
    expect(mockCapture).toHaveBeenCalledWith('birth_logged', {
      offspring_count: 2,
      live: true,
    });
  });

  it('forwards the event with undefined properties when none are given', () => {
    const analytics = loadAnalytics();
    analytics.initializeAnalytics();
    analytics.track('pregnancy_confirmed');
    expect(mockCapture).toHaveBeenCalledWith('pregnancy_confirmed', undefined);
  });

  it('rejects unknown event names at compile time', () => {
    const analytics = loadAnalytics();
    // @ts-expect-error 'not_a_real_event' is not a member of AnalyticsEvent
    const call = () => analytics.track('not_a_real_event');
    expect(call).not.toThrow();
  });
});

describe('identifyUser', () => {
  it('is safe before init and does not identify', () => {
    const analytics = loadAnalytics();
    expect(() => analytics.identifyUser('user_123')).not.toThrow();
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it('forwards the opaque user id after init', () => {
    const analytics = loadAnalytics();
    analytics.initializeAnalytics();
    analytics.identifyUser('user_123');
    expect(mockIdentify).toHaveBeenCalledWith('user_123');
  });
});

describe('resetAnalyticsUser', () => {
  it('is safe before init and does not reset', () => {
    const analytics = loadAnalytics();
    expect(() => analytics.resetAnalyticsUser()).not.toThrow();
    expect(mockReset).not.toHaveBeenCalled();
  });

  it('forwards reset to the client after init', () => {
    const analytics = loadAnalytics();
    analytics.initializeAnalytics();
    analytics.resetAnalyticsUser();
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
