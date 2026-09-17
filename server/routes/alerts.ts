import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List alerts
router.get('/', async (_req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        incident: {
          select: { id: true, title: true, priority: true, status: true },
        },
      },
    });

    const unreadCount = alerts.filter((a) => !a.read).length;
    return res.status(200).json({ alerts, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch alerts' });
  }
});

// 2. Broadcast / create alert (control-room, admin)
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, priority = 'medium', location, incidentId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required for alerts.' });
    }

    const alert = await prisma.alert.create({
      data: {
        title,
        description,
        priority,
        location,
        incidentId,
        read: false,
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          actorId: req.user.userId,
          actorName: req.user.name,
          action: `Broadcasted Alert: ${title} (${priority.toUpperCase()})`,
          entityType: 'Alert',
          entityId: alert.id,
          metadata: JSON.stringify({ priority, location }),
        },
      });
    }

    return res.status(201).json({
      message: 'Alert published successfully',
      alert,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create alert' });
  }
});

// 3. Mark alert as read
router.patch('/:id/read', async (req, res) => {
  try {
    const id = String(req.params.id);
    const alert = await prisma.alert.update({
      where: { id },
      data: { read: true },
    });

    return res.status(200).json({ alert });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to mark alert as read' });
  }
});

// 4. Mark all as read
router.post('/mark-all-read', async (_req, res) => {
  try {
    await prisma.alert.updateMany({
      where: { read: false },
      data: { read: true },
    });

    return res.status(200).json({ message: 'All alerts marked as read' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to mark all alerts as read' });
  }
});

// 5. Delete single alert
router.delete('/:id', requireAuth, requireRole(['admin', 'control-room']), async (req, res) => {
  try {
    const id = String(req.params.id);
    await prisma.alert.delete({
      where: { id },
    });

    return res.status(200).json({ message: `Alert ${id} deleted` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete alert' });
  }
});

// 6. Clear all alerts
router.delete('/', requireAuth, requireRole(['admin', 'control-room']), async (_req, res) => {
  try {
    await prisma.alert.deleteMany();
    return res.status(200).json({ message: 'All alerts cleared' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to clear alerts' });
  }
});

export default router;
