import { prisma } from './db';
import { hashPassword } from './auth';

export async function seedDatabase() {
  console.log('Seeding ResQMesh database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.syncOutbox.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.sOSRecord.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.report.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.meshNode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.incident.deleteMany();

  const defaultPasswordHash = await hashPassword('password123');

  // 2. Seed Incidents first
  const incidentsData = [
    {
      id: 'inc-001', title: 'Heavy Rainfall', category: 'Heavy Rainfall',
      description: 'Severe rainfall causing waterlogging and flooding in low-lying areas of Kothrud. Multiple residents stranded on rooftops. Water level rising rapidly.',
      priority: 'high', status: 'in-progress', latitude: 18.5074, longitude: 73.8077,
      locationName: 'Kothrud, Pune', reportedAt: new Date('2025-05-29T09:15:00+05:30'),
      reportedBy: 'Siddhi Pawar', peopleAffected: 12, distanceKm: 3.2, assignedTeamId: 'team-001',
    },
    {
      id: 'inc-002', title: 'Flooding - Mula River Basin', category: 'Flooding',
      description: 'Mula River water levels have breached danger mark. Nearby settlements at risk of inundation. Evacuation advisory issued.',
      priority: 'high', status: 'assigned', latitude: 18.5400, longitude: 73.8300,
      locationName: 'Mula River Basin, Pune', reportedAt: new Date('2025-05-29T08:30:00+05:30'),
      reportedBy: 'Amit Kale', peopleAffected: 45, distanceKm: 2.1, assignedTeamId: 'team-005',
    },
    {
      id: 'inc-003', title: 'Road Accident', category: 'Road Accident',
      description: 'Multi-vehicle collision on Hadapsar-Mundhwa road. Two vehicles involved. Minor injuries reported. Traffic disruption.',
      priority: 'low', status: 'reported', latitude: 18.5089, longitude: 73.9260,
      locationName: 'Hadapsar, Pune', reportedAt: new Date('2025-05-29T08:45:00+05:30'),
      reportedBy: 'Rohan Joshi', peopleAffected: 4, distanceKm: 7.8,
    },
    {
      id: 'inc-004', title: 'Traffic Blockage', category: 'Traffic Blockage',
      description: 'Major traffic jam due to waterlogged road. Vehicles stranded for over an hour. Alternate routes being diverted.',
      priority: 'medium', status: 'verified', latitude: 18.5978, longitude: 73.8075,
      locationName: 'Pimple Saudagar, Pune', reportedAt: new Date('2025-05-29T08:50:00+05:30'),
      reportedBy: 'Priya Desai', peopleAffected: 30, distanceKm: 5.6,
    },
    {
      id: 'inc-005', title: 'Power Outage', category: 'Power Outage',
      description: 'Complete power failure in Kondhwa area affecting residential complexes and hospitals. Backup generators running low on fuel.',
      priority: 'low', status: 'reported', latitude: 18.4632, longitude: 73.8898,
      locationName: 'Kondhwa, Pune', reportedAt: new Date('2025-05-29T08:15:00+05:30'),
      reportedBy: 'Siddhi Pawar', peopleAffected: 200, distanceKm: 9.4,
    },
    {
      id: 'inc-006', title: 'Building Collapse', category: 'Building Collapse',
      description: 'Partial collapse of old residential building. Multiple families trapped. Structural integrity compromised due to continuous rainfall.',
      priority: 'high', status: 'on-site', latitude: 18.5308, longitude: 73.8475,
      locationName: 'Shivajinagar, Pune', reportedAt: new Date('2025-05-29T07:45:00+05:30'),
      reportedBy: 'Vikram Singh', peopleAffected: 18, distanceKm: 1.5, assignedTeamId: 'team-005',
    },
    {
      id: 'inc-007', title: 'Gas Leak', category: 'Gas Leak',
      description: 'Industrial gas leak detected near residential area. Evacuating nearby residents. Emergency containment team requested.',
      priority: 'high', status: 'en-route', latitude: 18.5590, longitude: 73.8077,
      locationName: 'Aundh, Pune', reportedAt: new Date('2025-05-29T09:00:00+05:30'),
      reportedBy: 'Neha Kulkarni', peopleAffected: 50, distanceKm: 4.3, assignedTeamId: 'team-002',
    },
    {
      id: 'inc-009', title: 'Water Logging - Senapati Bapat Road', category: 'Water Logging',
      description: 'Underpass flooded with 3 feet water.',
      priority: 'medium', status: 'assigned', latitude: 18.5350, longitude: 73.8300,
      locationName: 'SB Road, Pune', reportedAt: new Date('2025-05-29T08:00:00+05:30'),
      reportedBy: 'Traffic Control', peopleAffected: 8, distanceKm: 2.0, assignedTeamId: 'team-003',
    },
    {
      id: 'inc-010', title: 'Transformer Fire', category: 'Fire',
      description: 'Electrical transformer on fire in Hinjawadi IT Park Phase 1.',
      priority: 'high', status: 'en-route', latitude: 18.5912, longitude: 73.7389,
      locationName: 'Hinjawadi, Pune', reportedAt: new Date('2025-05-29T09:10:00+05:30'),
      reportedBy: 'Security Lead', peopleAffected: 25, distanceKm: 6.0, assignedTeamId: 'team-006',
    },
  ];

  for (const inc of incidentsData) {
    await prisma.incident.create({ data: inc });
  }

  // 3. Seed Teams
  const teamsData = [
    { id: 'team-001', name: 'Team Alpha', specialties: JSON.stringify(['Ambulance', 'First Aid', 'Rescue']), status: 'assigned', latitude: 18.5100, longitude: 73.8100, currentIncidentId: 'inc-001' },
    { id: 'team-002', name: 'Team Bravo', specialties: JSON.stringify(['Rescuer', 'Medic', 'Hazmat']), status: 'en-route', latitude: 18.5550, longitude: 73.8100, currentIncidentId: 'inc-007' },
    { id: 'team-003', name: 'Team Charlie', specialties: JSON.stringify(['Rescuer', 'Driver', 'First Aid']), status: 'assigned', latitude: 18.5550, longitude: 73.7900, currentIncidentId: 'inc-009' },
    { id: 'team-004', name: 'Team Delta', specialties: JSON.stringify(['Technical', 'Drone', 'Surveillance']), status: 'available', latitude: 18.5100, longitude: 73.9200 },
    { id: 'team-005', name: 'Team Echo', specialties: JSON.stringify(['Medical', 'Emergency', 'Triage']), status: 'on-site', latitude: 18.5350, longitude: 73.8450, currentIncidentId: 'inc-006' },
    { id: 'team-006', name: 'Team Foxtrot', specialties: JSON.stringify(['Fire', 'Rescue', 'Hazmat']), status: 'en-route', latitude: 18.5900, longitude: 73.7400, currentIncidentId: 'inc-010' },
  ];

  for (const t of teamsData) {
    await prisma.team.create({ data: t });
  }

  // 4. Seed Users
  const usersData = [
    { id: 'user-001', name: 'Admin User', email: 'admin@resqmesh.in', password: defaultPasswordHash, role: 'admin', phone: '+91 98765 00001', location: 'Pune Command Center', status: 'available' },
    { id: 'user-002', name: 'Priya Sharma', email: 'priya.sharma@resqmesh.in', password: defaultPasswordHash, role: 'control-room', phone: '+91 98765 00002', location: 'Pune Command Center', status: 'available' },
    { id: 'user-003', name: 'Rahul Patil', email: 'rahul.patil@resqmesh.in', password: defaultPasswordHash, role: 'responder', phone: '+91 98765 43210', location: 'Field - Kothrud', teamId: 'team-001', status: 'busy' },
    { id: 'user-004', name: 'Siddhi Pawar', email: 'siddhi.pawar@resqmesh.in', password: defaultPasswordHash, role: 'citizen', phone: '+91 98765 00004', location: 'Kothrud, Pune', status: 'available' },
    { id: 'user-005', name: 'Dr. Priya Desai', email: 'priya.desai@resqmesh.in', password: defaultPasswordHash, role: 'responder', phone: '+91 98765 11111', location: 'Shivaji Nagar Shelter', teamId: 'team-005', status: 'available' },
    { id: 'user-006', name: 'Capt. Rajesh Sharma', email: 'rajesh.sharma@resqmesh.in', password: defaultPasswordHash, role: 'control-room', phone: '+91 98765 22222', location: 'Pune HQ', status: 'available' },
  ];

  for (const u of usersData) {
    await prisma.user.create({ data: u });
  }

  // 5. Seed Resources
  const resourcesData = [
    { id: 'res-001', name: 'Inflatable Rescue Boat', category: 'vehicle', available: 4, inUse: 2, total: 6, status: 'in-use', location: 'Kothrud Fire Station', assignedIncidentId: 'inc-001' },
    { id: 'res-002', name: 'Advanced Trauma Kit', category: 'medical', available: 8, inUse: 4, total: 12, status: 'in-use', location: 'Command Center Depot' },
    { id: 'res-003', name: 'Heavy Debris Cutter', category: 'equipment', available: 2, inUse: 1, total: 3, status: 'in-use', location: 'Shivajinagar Depot', assignedIncidentId: 'inc-006' },
    { id: 'res-004', name: 'Submersible Water Pump (5HP)', category: 'equipment', available: 5, inUse: 3, total: 8, status: 'in-use', location: 'Aundh Regional Storage' },
    { id: 'res-005', name: 'Emergency 4x4 Ambulance', category: 'vehicle', available: 3, inUse: 2, total: 5, status: 'in-use', location: 'Pune Central Hospital' },
    { id: 'res-006', name: 'High-Lumen Floodlight Mast', category: 'equipment', available: 6, inUse: 0, total: 6, status: 'available', location: 'Command Center Depot' },
  ];

  for (const r of resourcesData) {
    await prisma.resource.create({ data: r });
  }

  // 6. Seed Alerts
  const alertsData = [
    { id: 'alt-001', title: 'Critical Flash Flood Warning', description: 'Immediate evacuation required for low-lying areas in Kothrud and Karve Nagar.', priority: 'critical', location: 'Kothrud, Pune', incidentId: 'inc-001', read: false },
    { id: 'alt-002', title: 'Mula River Level Rising', description: 'River level crossing danger mark. Floodgates at Khadakwasla being opened.', priority: 'high', location: 'Mula River Basin', incidentId: 'inc-002', read: false },
    { id: 'alt-003', title: 'Industrial Gas Leak Hazard', description: 'Containment operation underway in Aundh sector. Residents advised to stay indoors with windows shut.', priority: 'high', location: 'Aundh Industrial Area', incidentId: 'inc-007', read: true },
    { id: 'alt-004', title: 'Shivajinagar Building Triage', description: 'Structural collapse response active. Medical evacuation corridor established.', priority: 'critical', location: 'Shivajinagar, Pune', incidentId: 'inc-006', read: false },
  ];

  for (const a of alertsData) {
    await prisma.alert.create({ data: a });
  }

  // 7. Seed Reports
  const reportsData = [
    {
      id: 'rep-001', reportId: 'REP-2025-001', title: 'Kothrud Flash Flood Initial Assessment', category: 'Incident Report',
      location: 'Kothrud, Pune', status: 'action-taken', submittedBy: 'user-003', notes: '45 residents successfully triaged. 2 rescue boats deployed.',
      incidentId: 'inc-001', dateTime: new Date('2025-05-29T10:00:00+05:30'),
    },
    {
      id: 'rep-002', reportId: 'REP-2025-002', title: 'Shivajinagar Structural Collapse Log', category: 'Damage Assessment',
      location: 'Shivajinagar, Pune', status: 'verified', submittedBy: 'user-005', notes: 'NDRF heavy cutters active on 2nd floor rubble.',
      incidentId: 'inc-006', dateTime: new Date('2025-05-29T08:30:00+05:30'),
    },
  ];

  for (const rep of reportsData) {
    await prisma.report.create({ data: rep });
  }

  // 8. Seed Chat Messages
  const messagesData = [
    { id: 'msg-001', teamId: 'team-001', senderId: 'user-002', senderName: 'Priya Sharma (Control Room)', senderRole: 'control-room', content: 'Team Alpha, proceed immediately to Kothrud sector 4.', timestamp: new Date(Date.now() - 1000 * 60 * 20) },
    { id: 'msg-002', teamId: 'team-001', senderId: 'user-003', senderName: 'Rahul Patil (Squad Lead)', senderRole: 'responder', content: 'Copy that Control Room. En route with inflatable boat.', timestamp: new Date(Date.now() - 1000 * 60 * 18) },
    { id: 'msg-003', teamId: 'team-001', senderId: 'user-003', senderName: 'Rahul Patil (Squad Lead)', senderRole: 'responder', content: 'On site now. Water level approximately 1.2 meters.', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
  ];

  for (const m of messagesData) {
    await prisma.chatMessage.create({ data: m });
  }

  // 9. Seed Mesh Nodes
  const meshNodesData = [
    { id: 'mesh-01', name: 'Kothrud Gateway Node', type: 'gateway', status: 'online', battery: 98, hops: 1, rssi: -45, latitude: 18.5074, longitude: 73.8077 },
    { id: 'mesh-02', name: 'Shivajinagar Relay 01', type: 'relay', status: 'online', battery: 84, hops: 2, rssi: -62, latitude: 18.5308, longitude: 73.8475 },
    { id: 'mesh-03', name: 'Aundh Terminal Beacon', type: 'terminal', status: 'online', battery: 92, hops: 2, rssi: -58, latitude: 18.5590, longitude: 73.8077 },
    { id: 'mesh-04', name: 'Hadapsar Repeater', type: 'relay', status: 'degraded', battery: 35, hops: 4, rssi: -85, latitude: 18.5089, longitude: 73.9260 },
  ];

  for (const node of meshNodesData) {
    await prisma.meshNode.create({ data: node });
  }

  // 10. Seed Activity Logs
  const activityLogsData = [
    {
      id: 'log-001', actorId: 'user-006', actorName: 'Capt. Rajesh Sharma', action: 'Dispatched Team Alpha to Kothrud Flash Flood',
      entityType: 'Team', entityId: 'team-001', timestamp: new Date(Date.now() - 1000 * 60 * 15),
      metadata: JSON.stringify({ priority: 'high', sector: 'Kothrud' }),
    },
    {
      id: 'log-002', actorId: 'user-005', actorName: 'Dr. Priya Desai', action: 'Dispatched 2x Mobile Trauma Kits to Shivaji Nagar Shelter',
      entityType: 'Resource', entityId: 'res-002', timestamp: new Date(Date.now() - 1000 * 60 * 95),
      metadata: JSON.stringify({ quantity: 2, recipient: 'Dr. Priya Desai' }),
    },
  ];

  for (const l of activityLogsData) {
    await prisma.activityLog.create({ data: l });
  }

  console.log('Database seeding completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .catch((e) => {
      console.error('Failed to seed database', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
