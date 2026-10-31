const mongoose = require('mongoose');
const { env } = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ [MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection warning: ${error.message}`);
    console.warn('ℹ️ Running in memory/stateless mode for unauthenticated flows.');
  }
}

async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  getIsConnected: () => isConnected,
};

