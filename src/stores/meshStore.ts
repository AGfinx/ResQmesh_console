import { create } from 'zustand';
import { ConnectivityMode, MeshNode, SyncOperation } from '@/types';
import { mockMeshNodes } from '@/data/meshNodes';
import { generateId } from '@/lib/utils';

export interface MeshMetrics {
  packetLossPercent: number;
  avgHopLatencyMs: number;
  activeRelaysCount: number;
  totalPacketsRouted: number;
}

interface MeshState {
  connectivityMode: ConnectivityMode;
  meshNodes: MeshNode[];
  syncQueue: SyncOperation[];
  metrics: MeshMetrics;
  setConnectivity: (mode: ConnectivityMode) => void;
  addToSyncQueue: (op: Omit<SyncOperation, 'id' | 'timestamp' | 'synced'>) => void;
  processSyncQueue: () => void;
  toggleNodeStatus: (nodeId: string) => void;
  updateMetrics: (partial: Partial<MeshMetrics>) => void;
}

export const useMeshStore = create<MeshState>((set, get) => ({
  connectivityMode: 'online',
  meshNodes: [...mockMeshNodes],
  syncQueue: [
    {
      id: 'sync-001',
      entity: 'Incident',
      entityId: 'inc-001',
      operation: 'update',
      payload: { status: 'in-progress' },
      timestamp: Date.now() - 120000,
      deviceId: 'node-alpha-01',
      synced: true,
    }
  ],
  metrics: {
    packetLossPercent: 0.8,
    avgHopLatencyMs: 42,
    activeRelaysCount: 4,
    totalPacketsRouted: 1420,
  },
  setConnectivity: (mode) => set({ connectivityMode: mode }),
  addToSyncQueue: (op) => {
    const newOp: SyncOperation = {
      ...op,
      id: `sync-${generateId()}`,
      timestamp: Date.now(),
      synced: get().connectivityMode === 'online',
    };
    set((state) => ({
      syncQueue: [newOp, ...state.syncQueue],
      metrics: {
        ...state.metrics,
        totalPacketsRouted: state.metrics.totalPacketsRouted + 1,
      }
    }));
  },
  processSyncQueue: () => set((state) => ({
    syncQueue: state.syncQueue.map(item => ({ ...item, synced: true })),
  })),
  toggleNodeStatus: (nodeId) => set((state) => ({
    meshNodes: state.meshNodes.map(node => {
      if (node.id === nodeId) {
        const nextStatus = node.status === 'online' ? 'degraded' : node.status === 'degraded' ? 'offline' : 'online';
        return { ...node, status: nextStatus };
      }
      return node;
    })
  })),
  updateMetrics: (partial) => set((state) => ({
    metrics: { ...state.metrics, ...partial }
  })),
}));

export type { MeshState };
export type { MeshNode };
export type { SyncOperation };
