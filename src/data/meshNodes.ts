import { MeshNode } from '@/types';

export const mockMeshNodes: MeshNode[] = [
  { id: 'mn-001', label: 'Kothrud Node', latitude: 18.5074, longitude: 73.8077, status: 'online', signalStrength: 92, batteryLevel: 85, connectedNodes: ['mn-002', 'mn-003'] },
  { id: 'mn-002', label: 'Shivajinagar Node', latitude: 18.5308, longitude: 73.8475, status: 'online', signalStrength: 88, batteryLevel: 72, connectedNodes: ['mn-001', 'mn-003', 'mn-004'] },
  { id: 'mn-003', label: 'Baner Node', latitude: 18.5590, longitude: 73.7868, status: 'degraded', signalStrength: 45, batteryLevel: 30, connectedNodes: ['mn-001', 'mn-002'] },
  { id: 'mn-004', label: 'Hadapsar Node', latitude: 18.5089, longitude: 73.9260, status: 'online', signalStrength: 95, batteryLevel: 90, connectedNodes: ['mn-002', 'mn-005'] },
  { id: 'mn-005', label: 'Hinjawadi Node', latitude: 18.5912, longitude: 73.7380, status: 'online', signalStrength: 80, batteryLevel: 65, connectedNodes: ['mn-004'] },
];
