const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/job_portal';
    
    // Attempt connecting to local / cloud MongoDB with a 3-second timeout
    const options = {
      serverSelectionTimeoutMS: 3000,
    };

    try {
      const conn = await mongoose.connect(mongoURI, options);
      console.log(`[DB] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (localErr) {
      console.warn(`[DB] Standard MongoDB connection failed (${localErr.message}). Starting MongoMemoryServer for seamless zero-config operation...`);
      mongod = await MongoMemoryServer.create();
      const memoryURI = mongod.getUri();
      const conn = await mongoose.connect(memoryURI);
      console.log(`[DB] Connected to In-Memory MongoDB Server: ${memoryURI}`);
      return conn;
    }
  } catch (error) {
    console.error(`[DB Error]: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[DB] Disconnected successfully');
  } catch (error) {
    console.error('[DB Disconnect Error]:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
