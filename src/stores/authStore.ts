import { create } from 'zustand';
import { User } from '@/types';
import { mockUsers } from '@/data/users';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  userStatus: 'available' | 'busy' | 'offline';
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: User['role']) => void;
  updateProfile: (data: Partial<User>) => void;
  setUserStatus: (status: 'available' | 'busy' | 'offline') => void;
}

const savedUserId = localStorage.getItem('resqmesh_user');
const savedUser = savedUserId ? mockUsers.find(u => u.id === savedUserId) || null : null;

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: savedUser || mockUsers[0],
  isAuthenticated: true,
  userStatus: 'available',
  login: (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('resqmesh_user', userId);
      set({ currentUser: user, isAuthenticated: true });
    }
  },
  logout: () => {
    localStorage.removeItem('resqmesh_user');
    set({ currentUser: null, isAuthenticated: false });
  },
  switchRole: (role) => {
    const user = mockUsers.find(u => u.role === role);
    if (user) {
      localStorage.setItem('resqmesh_user', user.id);
      set({ currentUser: user, isAuthenticated: true });
    }
  },
  updateProfile: (data) => set((state) => {
    if (!state.currentUser) return state;
    const updated = { ...state.currentUser, ...data };
    return { currentUser: updated };
  }),
  setUserStatus: (status) => set({ userStatus: status }),
}));
