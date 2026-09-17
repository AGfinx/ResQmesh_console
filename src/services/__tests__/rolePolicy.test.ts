import { describe, it, expect } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

describe('Role & Authentication Policy', () => {
  it('updates authentication state and persists selected user ID', () => {
    const authStore = useAuthStore.getState();

    // Login as responder
    authStore.login('user-003');
    expect(useAuthStore.getState().currentUser?.id).toBe('user-003');
    expect(useAuthStore.getState().currentUser?.role).toBe('responder');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(localStorage.getItem('resqmesh_user')).toBe('user-003');

    // Logout
    authStore.logout();
    expect(useAuthStore.getState().currentUser).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(localStorage.getItem('resqmesh_user')).toBeNull();
  });
});
