import { ChatMessage } from '@/types';

export const mockChatMessages: ChatMessage[] = [
  { id: 'msg-001', teamId: 'team-001', senderId: 'resp-001', senderName: 'Rahul Patil', senderRole: 'Team Lead', content: 'We are 2 km away from the site. Moving in 5 minutes.', timestamp: '2025-05-29T09:20:00+05:30', isOwn: false },
  { id: 'msg-002', teamId: 'team-001', senderId: 'resp-002', senderName: 'Sneha Sharma', senderRole: 'Coordinator', content: 'Understood. Keep us updated.', timestamp: '2025-05-29T09:21:00+05:30', isOwn: false },
  { id: 'msg-003', teamId: 'team-001', senderId: 'user-001', senderName: 'Admin User', senderRole: 'Control Room', content: 'Please check water levels near the bridge.', timestamp: '2025-05-29T09:22:00+05:30', isOwn: true },
  { id: 'msg-004', teamId: 'team-001', senderId: 'resp-003', senderName: 'Arjun More', senderRole: 'Drone Operator', content: 'Drone is ready for aerial assessment. Launching in 2 minutes.', timestamp: '2025-05-29T09:23:00+05:30', isOwn: false },
  { id: 'msg-005', teamId: 'team-001', senderId: 'resp-004', senderName: 'Priya Desai', senderRole: 'Field Officer', content: 'Confirmed — area around the bridge is accessible from the east side. Recommending approach via Paud Road.', timestamp: '2025-05-29T09:24:00+05:30', isOwn: false },
  { id: 'msg-006', teamId: 'team-001', senderId: 'resp-001', senderName: 'Rahul Patil', senderRole: 'Team Lead', content: 'Copy that. Team is moving via east approach. ETA 8 minutes.', timestamp: '2025-05-29T09:25:00+05:30', isOwn: false },
  { id: 'msg-007', teamId: 'team-001', senderId: 'user-001', senderName: 'Admin User', senderRole: 'Control Room', content: 'Good. Rescue boat has been dispatched to your location. It should arrive shortly.', timestamp: '2025-05-29T09:26:00+05:30', isOwn: true },
  { id: 'msg-008', teamId: 'team-001', senderId: 'resp-005', senderName: 'Vikram Singh', senderRole: 'Technical Analyst', content: 'Mesh connectivity stable in the area. Signal strength 88%.', timestamp: '2025-05-29T09:27:00+05:30', isOwn: false },
];
