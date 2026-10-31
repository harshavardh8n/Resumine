const { app } = require('./app');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');

async function startServer() {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 [Server] ResuMine backend listening on http://localhost:${env.PORT}`);
    console.log(`ℹ️ [Environment] Mode: ${env.NODE_ENV} | Model: ${env.GEMINI_MODEL}`);
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
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
