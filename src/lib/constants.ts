export const PUNE_CENTER = { lat: 18.5204, lng: 73.8567 };

export const PUNE_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Kothrud': { lat: 18.5074, lng: 73.8077 },
  'Aundh': { lat: 18.5590, lng: 73.8077 },
  'Baner': { lat: 18.5590, lng: 73.7868 },
  'Hadapsar': { lat: 18.5089, lng: 73.9260 },
  'Kondhwa': { lat: 18.4632, lng: 73.8898 },
  'Chinchwad': { lat: 18.6298, lng: 73.7997 },
  'Pimple Saudagar': { lat: 18.5978, lng: 73.8075 },
  'Hinjawadi': { lat: 18.5912, lng: 73.7380 },
  'Shivajinagar': { lat: 18.5308, lng: 73.8475 },
  'Kharadi': { lat: 18.5533, lng: 73.9404 },
  'NIBM': { lat: 18.4571, lng: 73.9053 },
  'Mula River Basin': { lat: 18.5400, lng: 73.8300 },
};

export const INCIDENT_CATEGORIES = [
  'Natural Disaster', 'Flooding', 'Heavy Rainfall', 'Road Accident',
  'Traffic Blockage', 'Power Outage', 'Building Collapse', 'Gas Leak',
  'Landslide', 'Water Logging', 'Fire', 'Bridge Damage', 'Electrical Hazard',
  'Medical Emergency', 'Missing Person', 'Structural Damage',
];

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  reported: ['verified', 'cancelled'],
  verified: ['assigned', 'cancelled'],
  assigned: ['en-route', 'cancelled'],
  'en-route': ['on-site'],
  'on-site': ['in-progress'],
  'in-progress': ['resolved'],
  resolved: ['closed'],
  closed: [],
  cancelled: [],
};
