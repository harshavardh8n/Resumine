const { app } = require('./src/app');
const { startServer } = require('./src/server');

// If executed directly via node index.js, start the server
if (require.main === module) {
  startServer();
}

// Export for serverless / Vercel
module.exports = app;
