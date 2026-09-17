import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { incidentCommandService } from '../services/incidentCommand';
import { resourceCommandService } from '../services/resourceCommand';
import { sosCommandService } from '../services/sosCommand';
import { optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const item = req.body;
    if (!item) {
      return res.status(400).json({ error: 'Payload body is required' });
    }

    const { id, idempotencyKey, entity, entityId, operation, payload } = item;
    const actorId = req.user?.userId;
    const actorName = req.user?.name || 'Offline Sync Worker';

    // 1. Check idempotency
    if (idempotencyKey) {
      const existingSync = await prisma.syncOutbox.findUnique({
        where: { idempotencyKey },
      });

      if (existingSync) {
        return res.status(200).json({
          success: true,
          status: 'synced',
          operationId: id,
          idempotencyKey,
          message: 'Operation already acknowledged and processed.',
        });
      }
    }

    // 2. Dispatch according to entity and operation
    try {
      if (entity === 'Incident') {
        if (operation === 'create') {
          await incidentCommandService.createIncident(payload, actorId, actorName);
        } else if (operation === 'update' && payload?.status && entityId) {
          await incidentCommandService.updateStatus(String(entityId), String(payload.status), actorId, actorName);
        } else if (operation === 'assign_team' && payload?.teamId && entityId) {
          await incidentCommandService.assignTeam(String(entityId), String(payload.teamId), actorId, actorName);
        }
      } else if (entity === 'Alert') {
        if (operation === 'create') {
          await prisma.alert.create({
            data: {
              title: payload.title,
              description: payload.description,
              priority: payload.priority || 'medium',
              location: payload.location,
              incidentId: payload.incidentId,
              read: false,
            },
          });
        } else if (operation === 'read' && entityId) {
          await prisma.alert.update({
            where: { id: String(entityId) },
            data: { read: true },
          });
        }
      } else if (entity === 'SOS') {
        if (operation === 'trigger') {
          await sosCommandService.triggerSOS(payload, actorId, actorName);
        }
      } else if (entity === 'Resource' && entityId) {
        if (operation === 'assign' && payload?.incidentId) {
          await resourceCommandService.assignResource(String(entityId), String(payload.incidentId), actorId, actorName);
        } else if (operation === 'release') {
          await resourceCommandService.releaseResource(String(entityId), actorId, actorName);
        }
      } else if (entity === 'ChatMessage') {
        await prisma.chatMessage.create({
          data: {
            teamId: payload.teamId,
            content: payload.content,
            senderId: payload.senderId || actorId,
            senderName: payload.senderName || actorName,
            senderRole: payload.senderRole || 'responder',
            timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
          },
        });
      }

      // Record in SyncOutbox
      if (idempotencyKey) {
        await prisma.syncOutbox.create({
          data: {
            id: id || idempotencyKey,
            idempotencyKey,
            entity: entity || 'General',
            entityId: entityId || 'unknown',
            operation: operation || 'mutation',
            payload: JSON.stringify(payload || {}),
            status: 'synced',
          },
        });
      }

      return res.status(200).json({
        success: true,
        receivedAt: new Date().toISOString(),
        operationId: id || 'ack-sync',
        idempotencyKey: idempotencyKey || null,
        status: 'synced',
      });
    } catch (dispatchErr: any) {
      console.warn('Sync dispatch error for operation:', id, dispatchErr.message);

      // Record failure in SyncOutbox
      if (idempotencyKey) {
        await prisma.syncOutbox.upsert({
          where: { idempotencyKey },
          create: {
            id: id || idempotencyKey,
            idempotencyKey,
            entity: entity || 'General',
            entityId: entityId || 'unknown',
            operation: operation || 'mutation',
            payload: JSON.stringify(payload || {}),
            status: 'failed',
            lastError: dispatchErr.message,
          },
          update: {
            status: 'failed',
            lastError: dispatchErr.message,
            retryCount: { increment: 1 },
          },
        });
      }

      return res.status(200).json({
        success: false,
        receivedAt: new Date().toISOString(),
        operationId: id,
        idempotencyKey,
        status: 'failed',
        error: dispatchErr.message,
      });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Sync gateway processing error' });
  }
});

router.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'operational',
    service: 'ResQMesh Outbox Sync Gateway',
    timestamp: new Date().toISOString(),
  });
});

export default router;
