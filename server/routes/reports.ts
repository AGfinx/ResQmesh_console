import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. List all reports
router.get('/', async (_req, res) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { dateTime: 'desc' },
      include: {
        incident: {
          select: { id: true, title: true, priority: true },
        },
      },
    });

    return res.status(200).json({ reports });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch reports' });
  }
});

// 2. Submit report
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, location, status = 'submitted', notes, incidentId } = req.body;

    if (!title || !category || !location) {
      return res.status(400).json({ error: 'Title, category, and location are required' });
    }

    const count = await prisma.report.count();
    const reportId = `REP-2025-${String(count + 1).padStart(3, '0')}`;
    const submittedBy = req.user?.userId;

    const report = await prisma.report.create({
      data: {
        reportId,
        title,
        category,
        location,
        status,
        submittedBy,
        notes,
        incidentId,
        dateTime: new Date(),
      },
    });

    if (req.user) {
      await prisma.activityLog.create({
        data: {
          actorId: req.user.userId,
          actorName: req.user.name,
          action: `Submitted Report: ${report.reportId} - ${title}`,
          entityType: 'Report',
          entityId: report.id,
        },
      });
    }

    return res.status(201).json({ report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit report' });
  }
});

// 3. Update report status
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({ report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update report status' });
  }
});

// 4. Delete report
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.report.delete({ where: { id } });
    return res.status(200).json({ message: `Report ${id} deleted` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete report' });
  }
});

export default router;
