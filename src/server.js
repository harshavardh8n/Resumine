const { app } = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer(targetPort = env.PORT) {
  await connectDB();

  const server = app.listen(targetPort);

  server.on('listening', () => {
    const addr = server.address();
    const port = typeof addr === 'string' ? addr : addr.port;
    console.log(`🚀 [Server] ResuMine backend listening on http://localhost:${port}`);
    console.log(`ℹ️ [Environment] Mode: ${env.NODE_ENV} | Model: ${env.GEMINI_MODEL}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ [Server] Port ${targetPort} is already in use.`);
      if (targetPort === 5000) {
        console.warn('💡 Note: On macOS, Port 5000 is occupied by Apple AirPlay Receiver (Control Center).');
      }
      const nextPort = targetPort + 1;
      console.log(`🔄 Attempting to start on port ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('❌ [Server] Fatal error:', err);
      process.exit(1);
    }
  });

  const handleShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
