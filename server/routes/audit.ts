import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. Get recent audit logs
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = '50', entityType } = req.query;
    const where = entityType ? { entityType: String(entityType) } : {};

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: Math.min(Number(limit), 200),
    });

    return res.status(200).json({ logs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});

// 2. Post new audit log
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, entityType, entityId, metadata } = req.body;

    if (!action || !entityType || !entityId) {
      return res.status(400).json({ error: 'Action, entityType, and entityId are required' });
    }

    const actorId = req.user?.userId;
    const actorName = req.user?.name || 'System Operator';

    const log = await prisma.activityLog.create({
      data: {
        actorId,
        actorName,
        action,
        entityType,
        entityId,
        metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
        timestamp: new Date(),
      },
    });

    return res.status(201).json({ log });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create audit log' });
  }
});

export default router;
