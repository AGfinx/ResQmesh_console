import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. Get messages for a team
router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    const where = teamId ? { teamId: String(teamId) } : {};

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      take: 100,
    });

    return res.status(200).json({ messages });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

// 2. Send message
router.post('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { teamId, content, senderName, senderRole } = req.body;

    if (!teamId || !content) {
      return res.status(400).json({ error: 'teamId and content are required' });
    }

    const senderId = req.user?.userId || 'usr-anonymous';
    const authorName = req.user?.name || senderName || 'Field Operative';
    const authorRole = req.user?.role || senderRole || 'responder';

    const message = await prisma.chatMessage.create({
      data: {
        teamId,
        content,
        senderId,
        senderName: authorName,
        senderRole: authorRole,
        timestamp: new Date(),
      },
    });

    return res.status(201).json({ message });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

export default router;
