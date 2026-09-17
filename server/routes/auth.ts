import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { hashPassword, comparePassword, signToken, requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// 1. Register new account
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'citizen', phone, location, teamId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role,
        phone,
        location,
        teamId,
        status: 'available',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        teamId: true,
        status: true,
        createdAt: true,
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// 2. Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, userId } = req.body;

    // Fast-track demo login by userId if password omitted and userId provided
    if (userId && !password) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          location: true,
          teamId: true,
          status: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });

      return res.status(200).json({
        message: 'Login successful',
        token,
        user,
      });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      teamId: user.teamId,
      status: user.status,
      createdAt: user.createdAt,
    };

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userProfile,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// 3. Current authenticated user profile (session restoration)
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        teamId: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
});

// 4. Logout
router.post('/logout', (_req: Request, res: Response) => {
  return res.status(200).json({ message: 'Logged out successfully' });
});

// 5. List all users (for roster / quick switch)
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        teamId: true,
        status: true,
        createdAt: true,
      },
      orderBy: { role: 'asc' },
    });

    return res.status(200).json({ users });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

// 6. Switch Role / Quick Login for field demo
router.post('/switch-role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Find first user with this role
    let user = await prisma.user.findFirst({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        location: true,
        teamId: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: `No user with role ${role} found.` });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.status(200).json({ token, user });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to switch role' });
  }
});

export default router;
