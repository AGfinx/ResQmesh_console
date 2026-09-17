import { create } from 'zustand';
import { Resource } from '@/types';
import { mockResources } from '@/data/resources';
import { generateId } from '@/lib/utils';
import { apiClient } from '@/services/api/client';

interface ResourceState {
  resources: Resource[];
  isLoading: boolean;
  assignResource: (id: string, incidentId: string) => void;
  releaseResource: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  fetchResources: () => Promise<void>;
}

export const useResourceStore = create<ResourceState>((set) => ({
  resources: [...mockResources],
  isLoading: false,
  assignResource: (id, incidentId) =>
    set((state) => ({
      resources: state.resources.map((r) => {
        if (r.id === id && r.available > 0) {
          return {
            ...r,
            available: r.available - 1,
            inUse: r.inUse + 1,
            status: 'in-use' as const,
            assignedIncidentId: incidentId,
          };
        }
        return r;
      }),
    })),
  releaseResource: (id) =>
    set((state) => ({
      resources: state.resources.map((r) => {
        if (r.id === id && r.inUse > 0) {
          const newInUse = r.inUse - 1;
          return {
            ...r,
            available: r.available + 1,
            inUse: newInUse,
            status: newInUse === 0 ? ('available' as const) : ('in-use' as const),
            assignedIncidentId: undefined,
          };
        }
        return r;
      }),
    })),
  addResource: (data) =>
    set((state) => ({
      resources: [...state.resources, { ...data, id: `res-${generateId()}` }],
    })),
  fetchResources: async () => {
    try {
      set({ isLoading: true });
      const serverResources = await apiClient.getResources();
      if (serverResources && serverResources.length > 0) {
        set({ resources: serverResources, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));

export type { ResourceState };
export type { Resource };
