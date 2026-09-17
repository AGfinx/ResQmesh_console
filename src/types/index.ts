export type UserRole = 'admin' | 'control-room' | 'responder' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  teamId?: string;
  location?: string;
}

export type IncidentPriority = 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'reported' | 'verified' | 'assigned' | 'en-route'
  | 'on-site' | 'in-progress' | 'resolved' | 'closed' | 'cancelled';

export interface Incident {
  id: string;
  title: string;
  category: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  reportedAt: string;
  reportedBy: string;
  peopleAffected: number;
  distanceKm?: number;
  assignedTeamId?: string;
  assignedResponderIds?: string[];
}

export type TeamStatus = 'available' | 'assigned' | 'en-route' | 'on-site' | 'busy' | 'offline';

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
  specialties: string[];
  status: TeamStatus;
  latitude: number;
  longitude: number;
  currentIncidentId?: string;
}

export interface Responder {
  id: string;
  name: string;
  role: string;
  teamId?: string;
  status: 'available' | 'busy' | 'offline';
  phone?: string;
  avatarUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface Resource {
  id: string;
  name: string;
  category: 'equipment' | 'vehicle' | 'medical';
  available: number;
  inUse: number;
  total: number;
  status: 'available' | 'in-use' | 'unavailable';
  location?: string;
  assignedIncidentId?: string;
}

export interface Report {
  id: string;
  title: string;
  reportId: string;
  dateTime: string;
  location: string;
  submittedBy: string;
  submitterRole: string;
  status: 'submitted' | 'draft' | 'reviewed' | 'archived';
  category: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
  createdAt: string;
  read: boolean;
  location?: string;
  incidentId?: string;
}

export interface MeshNode {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'degraded';
  signalStrength: number;
  batteryLevel: number;
  connectedNodes: string[];
}

export interface SyncOperation {
  id: string;
  entity: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: unknown;
  timestamp: number;
  deviceId: string;
  synced: boolean;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export type ConnectivityMode = 'online' | 'mesh' | 'offline';
export type SOSStatus = 'idle' | 'sending' | 'sent' | 'mesh-relay' | 'queued-offline' | 'acknowledged' | 'resolved';

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  facilities: string[];
  status: 'open' | 'full' | 'closed';
}

export interface ResponseRecommendation {
  incidentId: string;
  recommendedTeamId?: string;
  recommendedResources: string[];
  reason: string;
  confidence: number;
}
