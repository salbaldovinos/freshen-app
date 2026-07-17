// Auth façade. Screens and components import ONLY from this module — never from
// @clerk/expo directly (app/_layout.tsx owns the ClerkProvider). Two pieces live here:
//
//   1. useAuthStore()  — a React hook (NOT a Zustand store) wrapping Clerk's
//      useAuth()/useUser(). It keeps the historical `useAuthStore` import name so the
//      rest of the app has a single, provider-agnostic auth surface. Clerk state comes
//      from hooks, so a Zustand store would not have reactive session data — a hook is
//      the correct shape.
//
//   2. useSkippedAuth — a tiny Zustand store persisting the "continue without an
//      account" flag to AsyncStorage. It is a store (not a hook over storage) so the
//      root auth gate re-renders instantly when the user chooses to skip.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, useUser } from '@clerk/expo';
import { useRouter, useSegments } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { create } from 'zustand';

export const SKIPPED_AUTH_KEY = 'freshen-skipped-auth';

// Route groups an unauthenticated, non-skipped user is allowed to remain on.
const AUTH_ROUTES = new Set(['welcome', 'login', 'register']);

interface SkippedAuthState {
  /** Whether the user chose to use the app without an account. */
  skipped: boolean;
  /** True once the flag has been read from AsyncStorage at least once. */
  hydrated: boolean;
  /** Read the persisted flag into memory (call once on app start). */
  hydrate: () => Promise<void>;
  /** Persist the skip choice and flip the flag on. */
  skip: () => Promise<void>;
}

export const useSkippedAuth = create<SkippedAuthState>((set) => ({
  skipped: false,
  hydrated: false,
  hydrate: async () => {
    const value = await AsyncStorage.getItem(SKIPPED_AUTH_KEY);
    set({ skipped: value === 'true', hydrated: true });
  },
  skip: async () => {
    await AsyncStorage.setItem(SKIPPED_AUTH_KEY, 'true');
    set({ skipped: true });
  },
}));

export interface AuthFacade {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export function useAuthStore(): AuthFacade {
  const { isLoaded: authLoaded, isSignedIn, userId, signOut, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  const doSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const deleteAccount = useCallback(async () => {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error('EXPO_PUBLIC_BACKEND_URL is not set');
    }

    const token = await getToken();
    const response = await fetch(`${backendUrl}/api/account/delete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`Account deletion failed (${response.status})`);
    }

    await signOut();
  }, [getToken, signOut]);

  return {
    isAuthenticated: Boolean(isSignedIn),
    userId: userId ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    isLoading: !authLoaded || !userLoaded,
    signOut: doSignOut,
    deleteAccount,
  };
}

/**
 * Root auth gate. Once Clerk and the skip flag have both loaded, redirects an
 * unauthenticated, non-skipped user to /welcome. Call once from the root navigator
 * (inside ClerkProvider). Guards on `isLoaded` before reading `isSignedIn` so the
 * session has a chance to restore from the token cache first.
 */
export function useAuthGate(): void {
  const { isLoaded, isSignedIn } = useAuth();
  const skipped = useSkippedAuth((s) => s.skipped);
  const hydrated = useSkippedAuth((s) => s.hydrated);
  const hydrate = useSkippedAuth((s) => s.hydrate);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isLoaded || !hydrated) return;
    const inAuthRoute = AUTH_ROUTES.has(segments[0] ?? '');
    if (!isSignedIn && !skipped && !inAuthRoute) {
      router.replace('/welcome');
    }
  }, [isLoaded, isSignedIn, hydrated, skipped, segments, router]);
}
