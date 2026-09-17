import { Resource } from '@/types';

export const mockResources: Resource[] = [
  { id: 'res-001', name: 'Rescue Boat', category: 'equipment', available: 2, inUse: 1, total: 3, status: 'in-use', location: 'Kothrud Base', assignedIncidentId: 'inc-001' },
  { id: 'res-002', name: 'Inflatable Boat', category: 'equipment', available: 3, inUse: 0, total: 3, status: 'available', location: 'Central Depot' },
  { id: 'res-003', name: 'Drone', category: 'equipment', available: 2, inUse: 0, total: 2, status: 'available', location: 'Hinjawadi Tech Hub' },
  { id: 'res-004', name: 'Ambulance', category: 'vehicle', available: 1, inUse: 1, total: 2, status: 'in-use', location: 'Sassoon Hospital', assignedIncidentId: 'inc-006' },
  { id: 'res-005', name: 'Water Pump', category: 'equipment', available: 4, inUse: 0, total: 4, status: 'available', location: 'Fire Station Aundh' },
  { id: 'res-006', name: 'Life Jacket', category: 'equipment', available: 12, inUse: 0, total: 12, status: 'available', location: 'Central Depot' },
  { id: 'res-007', name: 'Fire Truck', category: 'vehicle', available: 1, inUse: 1, total: 2, status: 'in-use', location: 'Fire Station Hinjawadi', assignedIncidentId: 'inc-010' },
  { id: 'res-008', name: 'First Aid Kit', category: 'medical', available: 20, inUse: 5, total: 25, status: 'in-use', location: 'Multiple Locations' },
  { id: 'res-009', name: 'Stretcher', category: 'medical', available: 8, inUse: 2, total: 10, status: 'in-use', location: 'Hospitals' },
  { id: 'res-010', name: 'Generator', category: 'equipment', available: 3, inUse: 1, total: 4, status: 'in-use', location: 'Central Depot' },
];
