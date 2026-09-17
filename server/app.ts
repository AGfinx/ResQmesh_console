import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import incidentRoutes from './routes/incidents';
import teamRoutes from './routes/teams';
import resourceRoutes from './routes/resources';
import alertRoutes from './routes/alerts';
import sosRoutes from './routes/sos';
import messageRoutes from './routes/messages';
import reportRoutes from './routes/reports';
import auditRoutes from './routes/audit';
import meshRoutes from './routes/mesh';
import syncRoutes from './routes/sync';

dotenv.config();

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );
  app.use(express.json());

  // Health endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    return res.status(200).json({
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      service: 'ResQMesh Disaster Response Network',
      timestamp: new Date().toISOString(),
      capabilities: [
        'sqlite-prisma-persistence',
        'jwt-auth-rbac',
        'offline-outbox',
        'emergency-sos-beacon',
        'incident-management',
        'gps-telemetry',
        'team-dispatch',
      ],
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/incidents', incidentRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/resources', resourceRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/audit-logs', auditRoutes);
  app.use('/api/mesh', meshRoutes);
  app.use('/api/sync', syncRoutes);

  // Fallback 404
  app.use('/api', (_req: Request, res: Response) => {
    return res.status(404).json({ error: 'Endpoint not found' });
  });

  // Central error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    return res.status(500).json({
      error: err.message || 'Internal server error',
    });
  });

  return app;
};
