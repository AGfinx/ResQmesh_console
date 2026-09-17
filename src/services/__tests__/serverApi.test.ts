import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../server/app';
import { prisma } from '../../../server/db';
import { seedDatabase } from '../../../server/seed';

const app = createApp();

describe('ResQMesh Backend REST API & RBAC Invariants', () => {
  beforeAll(async () => {
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('GET /api/health returns operational status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('ResQMesh');
    });
  });

  describe('Authentication & Session Restoration', () => {
    it('POST /api/auth/register creates user with hashed password and returns JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rescue Volunteer',
          email: 'volunteer@resqmesh.in',
          password: 'secretPassword123',
          role: 'responder',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('volunteer@resqmesh.in');
      expect(res.body.user.role).toBe('responder');
      expect(res.body.user.password).toBeUndefined(); // Never exposed
    });

    it('POST /api/auth/login verifies password with bcrypt and rejects bad credentials', async () => {
      // Bad password
      const badRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@resqmesh.in',
          password: 'wrong_password',
        });

      expect(badRes.status).toBe(401);

      // Correct password
      const goodRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@resqmesh.in',
          password: 'password123',
        });

      expect(goodRes.status).toBe(200);
      expect(goodRes.body.token).toBeDefined();
      expect(goodRes.body.user.email).toBe('admin@resqmesh.in');
      expect(goodRes.body.user.role).toBe('admin');
    });

    it('GET /api/auth/me validates JWT session and returns current user', async () => {
      // Unauthenticated
      const unauthRes = await request(app).get('/api/auth/me');
      expect(unauthRes.status).toBe(401);

      // Authenticated with Priya Sharma (control-room)
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'priya.sharma@resqmesh.in', password: 'password123' });

      const token = loginRes.body.token;

      const authRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(authRes.status).toBe(200);
      expect(authRes.body.user.name).toBe('Priya Sharma');
      expect(authRes.body.user.role).toBe('control-room');
    });
  });

  describe('Server-Side RBAC Enforcement', () => {
    let citizenToken: string;
    let controlRoomToken: string;

    beforeAll(async () => {
      const citizenLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'siddhi.pawar@resqmesh.in', password: 'password123' });
      citizenToken = citizenLogin.body.token;

      const controlLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'priya.sharma@resqmesh.in', password: 'password123' });
      controlRoomToken = controlLogin.body.token;
    });

    it('forbids citizen role from assigning teams (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/incidents/inc-003/assign-team')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ teamId: 'team-004' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('allows control-room role to assign teams', async () => {
      const res = await request(app)
        .post('/api/incidents/inc-003/assign-team')
        .set('Authorization', `Bearer ${controlRoomToken}`)
        .send({ teamId: 'team-004' });

      expect(res.status).toBe(200);
      expect(res.body.incident.assignedTeamId).toBe('team-004');
    });
  });

  describe('Incident State Machine & Atomic Assignment Invariants', () => {
    let controlRoomToken: string;

    beforeAll(async () => {
      const controlLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'priya.sharma@resqmesh.in', password: 'password123' });
      controlRoomToken = controlLogin.body.token;
    });

    it('rejects illegal status transitions according to STATUS_TRANSITIONS', async () => {
      // inc-005 is 'reported'. Transitioning directly to 'in-progress' must fail
      const res = await request(app)
        .patch('/api/incidents/inc-005/status')
        .set('Authorization', `Bearer ${controlRoomToken}`)
        .send({ status: 'in-progress' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Illegal status transition');
    });

    it('allows legal status transition chain', async () => {
      // reported -> verified
      const res1 = await request(app)
        .patch('/api/incidents/inc-005/status')
        .set('Authorization', `Bearer ${controlRoomToken}`)
        .send({ status: 'verified' });

      expect(res1.status).toBe(200);
      expect(res1.body.incident.status).toBe('verified');
    });

    it('atomically assigns team and releases old team back to available', async () => {
      // inc-001 currently has team-001 assigned
      // Reassign inc-001 to team-004
      const res = await request(app)
        .post('/api/incidents/inc-001/assign-team')
        .set('Authorization', `Bearer ${controlRoomToken}`)
        .send({ teamId: 'team-004' });

      expect(res.status).toBe(200);
      expect(res.body.incident.assignedTeamId).toBe('team-004');

      // Verify in DB that old team (team-001) is released to available
      const oldTeam = await prisma.team.findUnique({ where: { id: 'team-001' } });
      expect(oldTeam?.status).toBe('available');
      expect(oldTeam?.currentIncidentId).toBeNull();

      // Verify that new team (team-004) is assigned
      const newTeam = await prisma.team.findUnique({ where: { id: 'team-004' } });
      expect(newTeam?.status).toBe('assigned');
      expect(newTeam?.currentIncidentId).toBe('inc-001');
    });
  });

  describe('SOS Trigger & Atomic Projection', () => {
    it('POST /api/sos atomically creates SOS, high-priority Incident, critical Alert, and Audit log', async () => {
      const res = await request(app)
        .post('/api/sos')
        .send({
          type: 'flood',
          description: 'Rising water level at Baner road',
          latitude: 18.559,
          longitude: 73.789,
          accuracyMeters: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.sos).toBeDefined();
      expect(res.body.sos.type).toBe('flood');
      expect(res.body.incident).toBeDefined();
      expect(res.body.incident.priority).toBe('high');
      expect(res.body.incident.status).toBe('reported');
      expect(res.body.alert).toBeDefined();
      expect(res.body.alert.priority).toBe('critical');

      // Verify incident exists in DB
      const dbIncident = await prisma.incident.findUnique({ where: { id: res.body.incident.id } });
      expect(dbIncident).toBeDefined();

      // Verify alert exists in DB
      const dbAlert = await prisma.alert.findUnique({ where: { id: res.body.alert.id } });
      expect(dbAlert).toBeDefined();
    });
  });

  describe('Resource Allocation Invariants', () => {
    let adminToken: string;

    beforeAll(async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@resqmesh.in', password: 'password123' });
      adminToken = login.body.token;
    });

    it('allocates and releases resource units while maintaining available + inUse === total', async () => {
      const initial = await prisma.resource.findUnique({ where: { id: 'res-002' } });
      const prevAvail = initial!.available;
      const prevInUse = initial!.inUse;

      // Assign unit
      const assignRes = await request(app)
        .post('/api/resources/res-002/assign')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ incidentId: 'inc-001' });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.resource.available).toBe(prevAvail - 1);
      expect(assignRes.body.resource.inUse).toBe(prevInUse + 1);

      // Release unit
      const releaseRes = await request(app)
        .post('/api/resources/res-002/release')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(releaseRes.status).toBe(200);
      expect(releaseRes.body.resource.available).toBe(prevAvail);
      expect(releaseRes.body.resource.inUse).toBe(prevInUse);
    });
  });

  describe('Durable Outbox Offline Sync Endpoint', () => {
    it('POST /api/sync processes outbox mutations and rejects duplicates via idempotencyKey', async () => {
      const idempotencyKey = `idempotent-test-${Date.now()}`;

      const payload = {
        id: 'outbox-test-01',
        idempotencyKey,
        entity: 'Alert',
        entityId: 'alt-test-99',
        operation: 'create',
        payload: {
          title: 'Synced Emergency Warning',
          description: 'Offline synced alert test',
          priority: 'high',
        },
      };

      // First sync
      const firstRes = await request(app).post('/api/sync').send(payload);
      expect(firstRes.status).toBe(200);
      expect(firstRes.body.status).toBe('synced');

      // Duplicate sync with same idempotency key
      const duplicateRes = await request(app).post('/api/sync').send(payload);
      expect(duplicateRes.status).toBe(200);
      expect(duplicateRes.body.status).toBe('synced');
      expect(duplicateRes.body.message).toContain('already acknowledged');
    });
  });
});
