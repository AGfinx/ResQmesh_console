import { openDB, IDBPDatabase } from 'idb';
import { Incident, Team, Alert, Resource, Report, ChatMessage, ActivityLog, SyncOperation, MeshNode } from '@/types';
import { mockIncidents } from '@/data/incidents';
import { mockTeams } from '@/data/teams';
import { mockAlerts } from '@/data/alerts';
import { mockResources } from '@/data/resources';
import { mockReports } from '@/data/reports';
import { mockChatMessages } from '@/data/chatMessages';
import { mockMeshNodes } from '@/data/meshNodes';

const DB_NAME = 'resqmesh_disaster_db';
const DB_VERSION = 1;

export interface PersistentSOS {
  id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  status: string;
  createdAt: string;
  acknowledgedAt?: string;
  incidentId?: string;
  synced: boolean;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

// Fallback in-memory / localStorage storage for environments without IndexedDB (e.g. some SSR/test runners)
const fallbackStorage: Record<string, Record<string, any>> = {};

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

export async function getDB(): Promise<IDBPDatabase | null> {
  if (!isIndexedDBAvailable()) return null;
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('incidents')) {
          db.createObjectStore('incidents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('teams')) {
          db.createObjectStore('teams', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('alerts')) {
          db.createObjectStore('alerts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('resources')) {
          db.createObjectStore('resources', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('reports')) {
          db.createObjectStore('reports', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('chatMessages')) {
          db.createObjectStore('chatMessages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meshNodes')) {
          db.createObjectStore('meshNodes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sosRecords')) {
          db.createObjectStore('sosRecords', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('activityLogs')) {
          db.createObjectStore('activityLogs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('outbox')) {
          db.createObjectStore('outbox', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDB();
  if (db) {
    // Check if initial seeding is needed
    const count = await db.count('incidents');
    if (count === 0) {
      const tx = db.transaction(['incidents', 'teams', 'alerts', 'resources', 'reports', 'chatMessages', 'meshNodes'], 'readwrite');
      for (const inc of mockIncidents) await tx.objectStore('incidents').put(inc);
      for (const team of mockTeams) await tx.objectStore('teams').put(team);
      for (const alert of mockAlerts) await tx.objectStore('alerts').put(alert);
      for (const res of mockResources) await tx.objectStore('resources').put(res);
      for (const rep of mockReports) await tx.objectStore('reports').put(rep);
      for (const msg of mockChatMessages) await tx.objectStore('chatMessages').put(msg);
      for (const node of mockMeshNodes) await tx.objectStore('meshNodes').put(node);
      await tx.done;
    }
  } else {
    // Initialize fallback storage
    if (!fallbackStorage['incidents']) {
      fallbackStorage['incidents'] = Object.fromEntries(mockIncidents.map(i => [i.id, i]));
      fallbackStorage['teams'] = Object.fromEntries(mockTeams.map(t => [t.id, t]));
      fallbackStorage['alerts'] = Object.fromEntries(mockAlerts.map(a => [a.id, a]));
      fallbackStorage['resources'] = Object.fromEntries(mockResources.map(r => [r.id, r]));
      fallbackStorage['reports'] = Object.fromEntries(mockReports.map(r => [r.id, r]));
      fallbackStorage['chatMessages'] = Object.fromEntries(mockChatMessages.map(m => [m.id, m]));
      fallbackStorage['meshNodes'] = Object.fromEntries(mockMeshNodes.map(n => [n.id, n]));
      fallbackStorage['sosRecords'] = {};
      fallbackStorage['activityLogs'] = {};
      fallbackStorage['outbox'] = {};
    }
  }
}

export const dbService = {
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      return db.getAll(storeName as any);
    }
    return Object.values(fallbackStorage[storeName] || {}) as T[];
  },

  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      return db.get(storeName as any, id);
    }
    return fallbackStorage[storeName]?.[id] as T | undefined;
  },

  async put<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      await db.put(storeName as any, item);
      return;
    }
    if (!fallbackStorage[storeName]) fallbackStorage[storeName] = {};
    fallbackStorage[storeName][item.id] = item;
  },

  async putMany<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      const tx = db.transaction(storeName as any, 'readwrite');
      for (const item of items) {
        await tx.store.put(item);
      }
      await tx.done;
      return;
    }
    if (!fallbackStorage[storeName]) fallbackStorage[storeName] = {};
    for (const item of items) {
      fallbackStorage[storeName][item.id] = item;
    }
  },

  async delete(storeName: string, id: string): Promise<void> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      await db.delete(storeName as any, id);
      return;
    }
    if (fallbackStorage[storeName]) {
      delete fallbackStorage[storeName][id];
    }
  },

  async clear(storeName: string): Promise<void> {
    const db = await getDB();
    if (db && db.objectStoreNames.contains(storeName as any)) {
      await db.clear(storeName as any);
      return;
    }
    fallbackStorage[storeName] = {};
  }
};
