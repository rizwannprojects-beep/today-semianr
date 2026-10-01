import mongoose from 'mongoose';
import dns from 'dns';
import environment from './environment.js';

// Resolve DNS SRV queries reliably across all environments (including Windows local dev)
try {
  if (environment.mongoUri && environment.mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  }
} catch (dnsErr) {
  console.warn('[Database] Note: Could not set custom DNS servers:', dnsErr.message);
}

let isConnected = false;

/**
 * Connect to MongoDB with connection event listeners and graceful lifecycle handling
 */
export const connectDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('[Database] MongoDB is already connected.');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(environment.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: environment.isDevelopment
    });

    isConnected = true;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect cleanly from MongoDB
 */
export const disconnectDatabase = async () => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('[Database] MongoDB connection closed gracefully.');
  }
};

/**
 * Return current connection state string
 */
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

// Global Mongoose runtime connection listeners
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB connection lost. State: disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Runtime Error]:', err.message);
});

export default { connectDatabase, disconnectDatabase, getConnectionStatus };
