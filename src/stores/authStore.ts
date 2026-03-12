import { create } from 'zustand';
import { User, getUser, isLoggedIn as checkLoggedIn } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  hydrate: () => void;
  setUser: (user: User | null) => void;
  setLoggedIn: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  hydrate: () => {
    set({ user: getUser(), isLoggedIn: checkLoggedIn() });
  },
  setUser: (user) => set({ user }),
  setLoggedIn: (val) => set({ isLoggedIn: val }),
}));
