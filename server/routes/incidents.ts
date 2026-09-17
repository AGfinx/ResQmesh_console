import { Router, Response } from 'express';
import { prisma } from '../db';
import { incidentCommandService } from '../services/incidentCommand';
import { requireAuth, requireRole, optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List all incidents
router.get('/', async (req, res) => {
  try {
    const { priority, status, category } = req.query;
    const where: any = {};
    if (priority) where.priority = String(priority);
    if (status) where.status = String(status);
    if (category) where.category = String(category);

    const incidents = await prisma.incident.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      include: {
        assignedTeams: true,
        resources: true,
        alerts: true,
      },
    });

    return res.status(200).json({ incidents });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch incidents' });
  }
});

// 2. Get single incident
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        assignedTeams: true,
        resources: true,
        alerts: true,
        reports: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ error: `Incident ${id} not found` });
    }

    return res.status(200).json({ incident });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch incident' });
  }
});

// 3. Create incident
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      category,
      description,
      priority = 'medium',
      latitude,
      longitude,
      locationName,
      reportedBy,
      peopleAffected,
      distanceKm,
      assignedTeamId,
    } = req.body;

    if (!title || !category || !description || latitude === undefined || longitude === undefined || !locationName) {
      return res.status(400).json({
        error: 'Missing required incident fields (title, category, description, latitude, longitude, locationName).',
      });
    }

    const actorId = req.user?.userId;
    const actorName = req.user?.name || reportedBy || 'Incident Reporter';

    const incident = await incidentCommandService.createIncident(
      {
        title,
        category,
        description,
        priority,
        latitude: Number(latitude),
        longitude: Number(longitude),
        locationName,
        reportedBy: reportedBy || actorName,
        peopleAffected: Number(peopleAffected || 0),
        distanceKm: distanceKm ? Number(distanceKm) : undefined,
        assignedTeamId,
      },
      actorId,
      actorName
    );

    return res.status(201).json({
      message: 'Incident created successfully',
      incident,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create incident' });
  }
});

// 4. Update status (enforce role: admin, control-room, responder)
router.patch('/:id/status', requireAuth, requireRole(['admin', 'control-room', 'responder']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const actorId = req.user!.userId;
    const actorName = req.user!.name;

    const updated = await incidentCommandService.updateStatus(id, status, actorId, actorName);
    return res.status(200).json({
      message: `Incident status updated to ${status}`,
      incident: updated,
    });
  } catch (error: any) {
    if (error.message && error.message.includes('Illegal status transition')) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message || 'Failed to update status' });
  }
});

// 5. Assign team (enforce role: admin, control-room)
router.post('/:id/assign-team', requireAuth, requireRole(['admin', 'control-room']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const actorId = req.user!.userId;
    const actorName = req.user!.name;

    const result = await incidentCommandService.assignTeam(id, teamId, actorId, actorName);
    return res.status(200).json({
      message: `Team successfully assigned to incident`,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to assign team' });
  }
});

export default router;
