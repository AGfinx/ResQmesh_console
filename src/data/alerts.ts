import { Alert } from '@/types';

export const mockAlerts: Alert[] = [
  { id: 'alt-001', title: 'Heavy rainfall reported in Kothrud', description: 'Severe rainfall with potential for flash flooding in Kothrud residential areas.', priority: 'critical', createdAt: '2025-05-29T09:15:00+05:30', read: false, location: 'Kothrud, Pune', incidentId: 'inc-001' },
  { id: 'alt-002', title: 'Flooding detected near Mula River Basin', description: 'Water levels crossing danger mark. Evacuation advisory in effect.', priority: 'critical', createdAt: '2025-05-29T08:30:00+05:30', read: false, location: 'Mula River Basin', incidentId: 'inc-002' },
  { id: 'alt-003', title: 'Team Alpha assigned to incident', description: 'Team Alpha has been dispatched to handle Heavy Rainfall incident in Kothrud.', priority: 'high', createdAt: '2025-05-29T09:20:00+05:30', read: false, incidentId: 'inc-001' },
  { id: 'alt-004', title: 'Drone assessment started', description: 'Aerial drone survey initiated for flood damage assessment in Kothrud.', priority: 'medium', createdAt: '2025-05-29T09:24:00+05:30', read: false, incidentId: 'inc-001' },
  { id: 'alt-005', title: 'Building collapse in Shivajinagar', description: 'Partial building collapse reported. Rescue operations underway.', priority: 'critical', createdAt: '2025-05-29T07:45:00+05:30', read: true, location: 'Shivajinagar, Pune', incidentId: 'inc-006' },
  { id: 'alt-006', title: 'Gas leak detected in Aundh', description: 'Industrial gas leak near residential zone. Evacuation in progress.', priority: 'high', createdAt: '2025-05-29T09:00:00+05:30', read: false, location: 'Aundh, Pune', incidentId: 'inc-007' },
  { id: 'alt-007', title: 'Fire outbreak at Hinjawadi IT Park', description: 'Warehouse fire reported. Fire engines dispatched.', priority: 'high', createdAt: '2025-05-29T09:25:00+05:30', read: false, location: 'Hinjawadi, Pune', incidentId: 'inc-010' },
  { id: 'alt-008', title: 'Power outage reported in Aundh', description: 'Complete power failure affecting hospitals and residences.', priority: 'medium', createdAt: '2025-05-29T08:15:00+05:30', read: true, location: 'Kondhwa, Pune', incidentId: 'inc-005' },
  { id: 'alt-009', title: 'Bridge inspection advisory', description: 'Structural cracks on Kharadi-Mundhwa bridge. Heavy vehicle restrictions.', priority: 'low', createdAt: '2025-05-29T08:00:00+05:30', read: true, location: 'Kharadi, Pune', incidentId: 'inc-011' },
  { id: 'alt-010', title: 'Mesh node MN-003 degraded', description: 'Signal strength below threshold at Baner mesh node.', priority: 'info', createdAt: '2025-05-29T09:10:00+05:30', read: true },
];
