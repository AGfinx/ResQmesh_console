import { User } from '@/types';

export const mockUsers: User[] = [
  { id: 'user-001', name: 'Admin User', email: 'admin@resqmesh.in', role: 'admin', phone: '+91 98765 00001', location: 'Pune Command Center' },
  { id: 'user-002', name: 'Priya Sharma', email: 'priya.sharma@resqmesh.in', role: 'control-room', phone: '+91 98765 00002', location: 'Pune Command Center' },
  { id: 'user-003', name: 'Rahul Patil', email: 'rahul.patil@resqmesh.in', role: 'responder', phone: '+91 98765 43210', location: 'Field - Kothrud', teamId: 'team-001' },
  { id: 'user-004', name: 'Siddhi Pawar', email: 'siddhi.pawar@resqmesh.in', role: 'citizen', phone: '+91 98765 00004', location: 'Kothrud, Pune' },
];
