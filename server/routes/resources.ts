import { Router, Response } from 'express';
import { prisma } from '../db';
import { resourceCommandService } from '../services/resourceCommand';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List resources
router.get('/', async (_req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      include: {
        assignedIncident: {
          select: { id: true, title: true, locationName: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ resources });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch resources' });
  }
});

// 2. Create resource (control-room, admin)
router.post('/', requireAuth, requireRole(['admin', 'control-room']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, total, location } = req.body;

    if (!name || !category || total === undefined) {
      return res.status(400).json({ error: 'Name, category, and total units are required.' });
    }

    const totalUnits = Number(total);
    const resource = await prisma.resource.create({
      data: {
        name,
        category,
        total: totalUnits,
        available: totalUnits,
        inUse: 0,
        status: 'available',
        location,
      },
    });

    return res.status(201).json({
      message: 'Resource registered successfully',
      resource,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create resource' });
  }
});

// 3. Assign resource unit (atomic)
router.post('/:id/assign', requireAuth, requireRole(['admin', 'control-room', 'responder']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { incidentId } = req.body;

    if (!incidentId) {
      return res.status(400).json({ error: 'incidentId is required to assign a resource' });
    }

    const actorId = req.user!.userId;
    const actorName = req.user!.name;

    const resource = await resourceCommandService.assignResource(id, String(incidentId), actorId, actorName);
    return res.status(200).json({
      message: 'Resource allocated successfully',
      resource,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to allocate resource' });
  }
});

// 4. Release resource unit (atomic)
router.post('/:id/release', requireAuth, requireRole(['admin', 'control-room', 'responder']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const actorId = req.user!.userId;
    const actorName = req.user!.name;

    const resource = await resourceCommandService.releaseResource(id, actorId, actorName);
    return res.status(200).json({
      message: 'Resource released successfully',
      resource,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to release resource' });
  }
});

export default router;
