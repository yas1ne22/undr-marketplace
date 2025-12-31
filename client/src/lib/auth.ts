import { api } from './api';
import { create } from 'zustand';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  checkAuth: () => Promise<void>;
  login: (phoneNumber: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  checkAuth: async () => {
    try {
      const user = await api.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (phoneNumber: string, code: string) => {
    const result = await api.verifyOTP(phoneNumber, code);
    set({ user: result.user, isAuthenticated: true });
  },

  logout: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  },
}));

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuth.getState().checkAuth();
}
