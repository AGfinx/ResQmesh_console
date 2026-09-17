export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const item = req.body;
    return res.status(200).json({
      success: true,
      receivedAt: new Date().toISOString(),
      operationId: item?.id || 'ack-sync',
      idempotencyKey: item?.idempotencyKey || null,
      status: 'synced',
    });
  }

  return res.status(200).json({
    status: 'operational',
    service: 'ResQMesh Outbox Sync Gateway',
    timestamp: new Date().toISOString(),
  });
}
