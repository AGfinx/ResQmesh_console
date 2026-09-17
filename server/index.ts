import { createApp } from './app';
import { prisma } from './db';

const app = createApp();
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 ResQMesh Command Server running on http://localhost:${PORT}`);
  console.log(`📡 Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down ResQMesh server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server and database connections closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
