import { describe, it, expect, beforeEach } from 'vitest';
import { outboxManager } from '@/services/sync/outbox';
import { dbService } from '@/services/db';

describe('Durable Outbox Sync Engine', () => {
  beforeEach(async () => {
    await dbService.clear('outbox');
    await outboxManager.setSimulatedConnectivity(true);
  });

  it('enqueues mutations and generates unique idempotency keys', async () => {
    const item1 = await outboxManager.enqueue('Incident', 'inc-100', 'create', { title: 'Test 1' });
    const item2 = await outboxManager.enqueue('Incident', 'inc-101', 'create', { title: 'Test 2' });

    expect(item1.id).toBeDefined();
    expect(item2.id).toBeDefined();
    expect(item1.id).not.toBe(item2.id);
    expect(item1.idempotencyKey).not.toBe(item2.idempotencyKey);
  });

  it('keeps mutations pending when offline, then synchronizes upon reconnection', async () => {
    // 1. Go offline
    await outboxManager.setSimulatedConnectivity(false);

    const queuedItem = await outboxManager.enqueue('Alert', 'alt-100', 'create', { title: 'Flood Alert' });
    expect(queuedItem.status).toBe('pending');

    const pendingCount = await outboxManager.getPendingCount();
    expect(pendingCount).toBeGreaterThanOrEqual(1);

    // 2. Reconnect: reconnecting automatically drains the outbox queue
    await outboxManager.setSimulatedConnectivity(true);

    const allItems = await outboxManager.getAll();
    const synced = allItems.find((i) => i.id === queuedItem.id);
    expect(synced?.status).toBe('synced');

    const remainingPending = await outboxManager.getPendingCount();
    expect(remainingPending).toBe(0);
  });
});
