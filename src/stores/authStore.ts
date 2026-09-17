import { create } from 'zustand';
import { User } from '@/types';
import { mockUsers } from '@/data/users';
import { CONFIG } from '@/config';

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userStatus: 'available' | 'busy' | 'offline';
  login: (emailOrUserId: string, password?: string) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; role?: string; phone?: string; location?: string }) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: User['role']) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  setUserStatus: (status: 'available' | 'busy' | 'offline') => void;
  restoreSession: () => Promise<void>;
}

const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('resqmesh_user') : null;
const savedToken = typeof window !== 'undefined' ? localStorage.getItem('resqmesh_token') : null;
const initialUser = savedUserId ? mockUsers.find((u) => u.id === savedUserId) || mockUsers[0] : mockUsers[0];

const getApiBase = () => CONFIG.API_BASE_URL || '';

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: initialUser,
  token: savedToken,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  userStatus: 'available',

  login: async (emailOrUserId: string, password?: string) => {
    // If it's a mock userId or fast switch without password, immediately update local state for seamless UX
    const mockMatch = mockUsers.find((u) => u.id === emailOrUserId || u.email === emailOrUserId);
    if (mockMatch && !password) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('resqmesh_user', mockMatch.id);
      }
      set({ currentUser: mockMatch, isAuthenticated: true, error: null, isLoading: false });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const isEmail = emailOrUserId.includes('@');
      const payload = isEmail
        ? { email: emailOrUserId, password }
        : password
        ? { email: emailOrUserId, password }
        : { userId: emailOrUserId };

      const res = await fetch(`${getApiBase()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const user: User = data.user;
        const token = data.token;

        if (typeof window !== 'undefined') {
          localStorage.setItem('resqmesh_token', token);
          localStorage.setItem('resqmesh_user', user.id);
        }

        set({
          currentUser: user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        // If demo fast login with userId fallback
        const mockFallback = mockUsers.find((u) => u.id === emailOrUserId || u.email === emailOrUserId);
        if (mockFallback && !password) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('resqmesh_user', mockFallback.id);
          }
          set({
            currentUser: mockFallback,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }

        set({
          isLoading: false,
          error: errData.error || 'Authentication failed. Please check your credentials.',
        });
        return false;
      }
    } catch (e: any) {
      // Offline fallback
      const mockFallback = mockUsers.find((u) => u.id === emailOrUserId || u.email === emailOrUserId);
      if (mockFallback) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('resqmesh_user', mockFallback.id);
        }
        set({
          currentUser: mockFallback,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      }

      set({
        isLoading: false,
        error: e.message || 'Network error occurred during login.',
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${getApiBase()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
        const data = await res.json();
        const user: User = data.user;
        const token = data.token;

        if (typeof window !== 'undefined') {
          localStorage.setItem('resqmesh_token', token);
          localStorage.setItem('resqmesh_user', user.id);
        }

        set({
          currentUser: user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        const err = await res.json().catch(() => ({}));
        set({
          isLoading: false,
          error: err.error || 'Registration failed.',
        });
        return false;
      }
    } catch (e: any) {
      set({
        isLoading: false,
        error: e.message || 'Network error occurred during registration.',
      });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('resqmesh_token');
      localStorage.removeItem('resqmesh_user');
    }
    fetch(`${getApiBase()}/api/auth/logout`, { method: 'POST' }).catch(() => {});
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  switchRole: async (role) => {
    try {
      const res = await fetch(`${getApiBase()}/api/auth/switch-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined') {
          localStorage.setItem('resqmesh_token', data.token);
          localStorage.setItem('resqmesh_user', data.user.id);
        }
        set({
          currentUser: data.user,
          token: data.token,
          isAuthenticated: true,
        });
        return;
      }
    } catch {
      // Fallback
    }

    const fallbackUser = mockUsers.find((u) => u.role === role);
    if (fallbackUser) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('resqmesh_user', fallbackUser.id);
      }
      set({ currentUser: fallbackUser, isAuthenticated: true });
    }
  },

  updateProfile: (data) =>
    set((state) => {
      if (!state.currentUser) return state;
      const updated = { ...state.currentUser, ...data };
      return { currentUser: updated };
    }),

  setUserStatus: (status) => set({ userStatus: status }),

  restoreSession: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('resqmesh_token') : null;
    if (!token) return;

    try {
      const res = await fetch(`${getApiBase()}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        set({
          currentUser: data.user,
          token,
          isAuthenticated: true,
        });
      }
    } catch {
      // Keep offline session
    }
  },
}));
