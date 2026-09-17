type EventHandler = (data?: any) => void;

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  emit(event: string, data?: any): void {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }
}

export const eventBus = new EventBus();

export const Events = {
  INCIDENT_CREATED: 'INCIDENT_CREATED',
  INCIDENT_UPDATED: 'INCIDENT_UPDATED',
  TEAM_STATUS_UPDATED: 'TEAM_STATUS_UPDATED',
  RESOURCE_UPDATED: 'RESOURCE_UPDATED',
  ALERT_CREATED: 'ALERT_CREATED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  SOS_RECEIVED: 'SOS_RECEIVED',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
} as const;
