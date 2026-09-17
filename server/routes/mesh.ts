import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List mesh nodes
router.get('/nodes', async (_req: Request, res: Response) => {
  try {
    const nodes = await prisma.meshNode.findMany({
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ nodes });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch mesh nodes' });
  }
});

// 2. Update mesh node telemetry
router.patch('/nodes/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, battery, hops, rssi, latitude, longitude } = req.body;

    const updated = await prisma.meshNode.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(battery !== undefined ? { battery: Number(battery) } : {}),
        ...(hops !== undefined ? { hops: Number(hops) } : {}),
        ...(rssi !== undefined ? { rssi: Number(rssi) } : {}),
        ...(latitude !== undefined ? { latitude: Number(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: Number(longitude) } : {}),
        lastSeen: new Date(),
      },
    });

    return res.status(200).json({ node: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update node' });
  }
});

export default router;
