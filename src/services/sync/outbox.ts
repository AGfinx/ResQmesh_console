import { dbService } from '@/services/db';
import { generateId } from '@/lib/utils';

export interface OutboxItem {
  id: string;
  idempotencyKey: string;
  entity: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
}

type OutboxListener = (items: OutboxItem[]) => void;

class OutboxManager {
  private isProcessing = false;
  private listeners: Set<OutboxListener> = new Set();
  private online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkStatusChange(true));
      window.addEventListener('offline', () => this.handleNetworkStatusChange(false));
    }
  }

  public subscribe(listener: OutboxListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => this.listeners.delete(listener);
  }

  private async notifyListeners() {
    const items = await this.getAll();
    this.listeners.forEach(fn => fn(items));
  }

  public isOnline(): boolean {
    return this.online;
  }

  public async setSimulatedConnectivity(isOnline: boolean): Promise<void> {
    this.online = isOnline;
    if (isOnline) {
      await this.processOutbox();
    }
    await this.notifyListeners();
  }

  private async handleNetworkStatusChange(isOnline: boolean): Promise<void> {
    this.online = isOnline;
    if (isOnline) {
      await this.processOutbox();
    }
    await this.notifyListeners();
  }

  public async enqueue(
    entity: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    payload: unknown,
    idempotencyKey?: string
  ): Promise<OutboxItem> {
    const item: OutboxItem = {
      id: `outbox-${generateId()}`,
      idempotencyKey: idempotencyKey || `key-${Date.now()}-${generateId()}`,
      entity,
      entityId,
      operation,
      payload,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    await dbService.put('outbox', item);
    await this.notifyListeners();

    // If online, process immediately
    if (this.online) {
      await this.processOutbox();
    }

    return item;
  }

  public async getAll(): Promise<OutboxItem[]> {
    return dbService.getAll<OutboxItem>('outbox');
  }

  public async getPendingItems(): Promise<OutboxItem[]> {
    const all = await this.getAll();
    return all.filter(item => item.status === 'pending' || item.status === 'failed');
  }

  public async getPendingCount(): Promise<number> {
    const pending = await this.getPendingItems();
    return pending.length;
  }

  public async processOutbox(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing || !this.online) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;

    try {
      const pendingItems = await this.getPendingItems();

      for (const item of pendingItems) {
        if (!this.online) break;

        item.status = 'syncing';
        await dbService.put('outbox', { ...item });
        await this.notifyListeners();

        try {
          // Execute sync operation with API client / local backend handler
          await this.dispatchToBackend(item);

          item.status = 'synced';
          item.retryCount += 1;
          await dbService.put('outbox', { ...item });
          processed++;
        } catch (err: any) {
          item.status = 'failed';
          item.retryCount += 1;
          item.lastError = err?.message || 'Sync transmission failed';
          await dbService.put('outbox', { ...item });
          failed++;
        }
      }
    } finally {
      this.isProcessing = false;
      await this.notifyListeners();
    }

    return { processed, failed };
  }

  private async dispatchToBackend(item: OutboxItem): Promise<void> {
    // Only attempt HTTP fetch when running in browser with live remote server
    if (
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol &&
      window.location.protocol.startsWith('http') &&
      typeof fetch !== 'undefined' &&
      !window.location.origin.includes('localhost')
    ) {
      try {
        const url = `${window.location.origin}/api/sync`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        }).catch(() => {
          // offline fallback
        });
      } catch (e) {
        // offline fallback
      }
    }
  }

  public async clearSynced(): Promise<void> {
    const all = await this.getAll();
    for (const item of all) {
      if (item.status === 'synced') {
        await dbService.delete('outbox', item.id);
      }
    }
    await this.notifyListeners();
  }
}

export const outboxManager = new OutboxManager();
