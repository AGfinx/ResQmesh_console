import { Team } from '@/types';

export const mockTeams: Team[] = [
  { id: 'team-001', name: 'Team Alpha', memberIds: ['resp-001','resp-002','resp-003','resp-004','resp-005'], specialties: ['Ambulance','First Aid','Rescue'], status: 'assigned', latitude: 18.5100, longitude: 73.8100, currentIncidentId: 'inc-001' },
  { id: 'team-002', name: 'Team Bravo', memberIds: ['resp-006','resp-007','resp-008','resp-009'], specialties: ['Rescuer','Medic','Hazmat'], status: 'en-route', latitude: 18.5550, longitude: 73.8100, currentIncidentId: 'inc-007' },
  { id: 'team-003', name: 'Team Charlie', memberIds: ['resp-010','resp-011','resp-012','resp-013','resp-014','resp-015'], specialties: ['Rescuer','Driver','First Aid'], status: 'assigned', latitude: 18.5550, longitude: 73.7900, currentIncidentId: 'inc-009' },
  { id: 'team-004', name: 'Team Delta', memberIds: ['resp-003','resp-016','resp-017','resp-018'], specialties: ['Technical','Drone','Surveillance'], status: 'available', latitude: 18.5100, longitude: 73.9200 },
  { id: 'team-005', name: 'Team Echo', memberIds: ['resp-006','resp-019','resp-020','resp-021','resp-022'], specialties: ['Medical','Emergency','Triage'], status: 'on-site', latitude: 18.5350, longitude: 73.8450, currentIncidentId: 'inc-006' },
  { id: 'team-006', name: 'Team Foxtrot', memberIds: ['resp-010','resp-023','resp-024'], specialties: ['Fire','Rescue','Hazmat'], status: 'en-route', latitude: 18.5900, longitude: 73.7400, currentIncidentId: 'inc-010' },
];
