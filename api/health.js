export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    status: 'healthy',
    environment: 'production',
    service: 'ResQMesh Disaster Response Network',
    timestamp: new Date().toISOString(),
    capabilities: [
      'offline-outbox',
      'emergency-sos-beacon',
      'incident-management',
      'gps-telemetry',
      'team-dispatch'
    ]
  });
}
