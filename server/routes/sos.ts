import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { sosCommandService } from '../services/sosCommand';
import { optionalAuth, requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. Trigger Emergency SOS Beacon
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type = 'emergency', description, latitude = 18.5204, longitude = 73.8567, accuracyMeters } = req.body;

    const actorId = req.user?.userId;
    const actorName = req.user?.name || 'Citizen SOS Beacon';

    const result = await sosCommandService.triggerSOS(
      {
        type,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracyMeters: accuracyMeters ? Number(accuracyMeters) : undefined,
      },
      actorId,
      actorName
    );

    return res.status(201).json({
      message: 'SOS beacon successfully registered and dispatched to Command Center',
      ...result,
    });
  } catch (error: any) {
    console.error('SOS dispatch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to dispatch SOS' });
  }
});

// 2. List all SOS records
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sosRecords = await prisma.sOSRecord.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ sosRecords });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch SOS records' });
  }
});

// 3. Resolve SOS
router.post('/:id/resolve', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const actorId = req.user!.userId;
    const actorName = req.user!.name;

    const sos = await sosCommandService.resolveSOS(id, actorId, actorName);
    return res.status(200).json({ message: 'SOS resolved', sos });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to resolve SOS' });
  }
});

export default router;
