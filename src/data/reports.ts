import { Report } from '@/types';

export const mockReports: Report[] = [
  { id: 'rpt-001', title: 'Heavy Rainfall — Kothrud', reportId: 'REP-2025-0001', dateTime: '2025-05-29T09:45:00+05:30', location: 'Kothrud, Pune', submittedBy: 'Siddhi Pawar', submitterRole: 'Citizen', status: 'submitted', category: 'Incident Report' },
  { id: 'rpt-002', title: 'Flooding — Mula River Basin', reportId: 'REP-2025-0002', dateTime: '2025-05-29T08:30:00+05:30', location: 'Mula River Basin, Pune', submittedBy: 'Siddhi Pawar', submitterRole: 'Citizen', status: 'submitted', category: 'Incident Report' },
  { id: 'rpt-003', title: 'Road Blocked — Chinchwad', reportId: 'REP-2025-0003', dateTime: '2025-05-28T19:15:00+05:30', location: 'Chinchwad, Pune', submittedBy: 'Amit Kale', submitterRole: 'Citizen', status: 'draft', category: 'Incident Report' },
  { id: 'rpt-004', title: 'Power Outage — Aundh', reportId: 'REP-2025-0004', dateTime: '2025-05-28T18:00:00+05:30', location: 'Aundh, Pune', submittedBy: 'Siddhi Pawar', submitterRole: 'Citizen', status: 'submitted', category: 'Incident Report' },
  { id: 'rpt-005', title: 'Community Drill — Baner', reportId: 'REP-2025-0005', dateTime: '2025-05-27T10:00:00+05:30', location: 'Baner, Pune', submittedBy: 'Siddhi Pawar', submitterRole: 'Citizen', status: 'submitted', category: 'Activity Log' },
];
