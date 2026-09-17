import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List all teams
router.get('/', async (_req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            phone: true,
          },
        },
        currentIncident: true,
      },
      orderBy: { name: 'asc' },
    });

    // Format specialties from JSON string if needed
    const formattedTeams = teams.map((team) => {
      let specialtiesList: string[] = [];
      try {
        specialtiesList = JSON.parse(team.specialties);
      } catch {
        specialtiesList = team.specialties.split(',').map((s) => s.trim());
      }

      return {
        ...team,
        specialties: specialtiesList,
        memberIds: team.members.map((m) => m.id),
      };
    });

    return res.status(200).json({ teams: formattedTeams });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch teams' });
  }
});

// 2. Get single team
router.get('/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            phone: true,
          },
        },
        currentIncident: true,
        messages: {
          take: 50,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: `Team ${id} not found` });
    }

    let specialtiesList: string[] = [];
    try {
      specialtiesList = JSON.parse(team.specialties);
    } catch {
      specialtiesList = team.specialties.split(',').map((s) => s.trim());
    }

    return res.status(200).json({
      team: {
        ...team,
        specialties: specialtiesList,
        memberIds: team.members.map((m) => m.id),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch team' });
  }
});

// 3. Update team status (responder, control-room, admin)
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await prisma.team.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      message: 'Team status updated',
      team: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update team status' });
  }
});

// 4. Update team GPS location
router.patch('/:id/location', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const updated = await prisma.team.update({
      where: { id },
      data: {
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    });

    return res.status(200).json({
      message: 'Team location updated',
      team: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update team location' });
  }
});

// 5. Create new team (control-room, admin)
router.post('/', requireAuth, requireRole(['admin', 'control-room']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, specialties, latitude, longitude } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Team name and coordinates are required' });
    }

    const specialtiesStr = Array.isArray(specialties) ? JSON.stringify(specialties) : specialties || '[]';

    const team = await prisma.team.create({
      data: {
        name,
        specialties: specialtiesStr,
        latitude: Number(latitude),
        longitude: Number(longitude),
        status: 'available',
      },
    });

    return res.status(201).json({
      message: 'Team created successfully',
      team,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to create team' });
  }
});

export default router;
