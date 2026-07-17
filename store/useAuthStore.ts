import { create } from 'zustand';

interface AuthStoreState {
  session: null;
  user: null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthStoreActions {
  initialize: () => void;
  signIn: (email: string, password: string) => void;
  signUp: (email: string, password: string) => void;
  signOut: () => void;
  refreshSession: () => void;
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>((set) => ({
  // State defaults
  session: null,
  user: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions — MVP stubs. Supabase integration comes in Phase 7.
  initialize: () => {
    set({ isAuthenticated: false, isLoading: false });
  },

  signIn: (_email: string, _password: string) => {
    // No-op for MVP
  },

  signUp: (_email: string, _password: string) => {
    // No-op for MVP
  },

  signOut: () => {
    set({ user: null, session: null, isAuthenticated: false });
  },

  refreshSession: () => {
    // No-op for MVP
  },
}));
