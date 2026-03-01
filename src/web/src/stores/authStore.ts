import { create } from 'zustand';
import { authApi } from '../services/api';
import type { User } from '../types/quiz';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: { name?: string; avatarSeed?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await authApi.login(email, password);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (name, email, password) => {
    const { data } = await authApi.register(name, email, password);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      const { data } = await authApi.me();
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: async (updateData) => {
    const { data } = await authApi.updateProfile(updateData);
    set({ user: data.user });
  },
}));
