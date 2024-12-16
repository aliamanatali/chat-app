
import { create } from 'zustand/react';
import { User } from '../types/types';

interface UserStore {
  user: User | null;
  setUser: (userData: User) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (userData: User) => set({ user: userData }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
