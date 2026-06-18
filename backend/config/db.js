const mongoose = require('mongoose');

let isConnecting = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (isConnecting) {
    return isConnecting;
  }

  isConnecting = (async () => {
    let uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI or MONGODB_URI environment variable is missing. In-memory database is not supported in production serverless environments.');
      }
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('Spun up purely in-memory MongoDB Server since no MONGO_URI was provided.');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  })();

  try {
    const conn = await isConnecting;
    return conn;
  } catch (error) {
    console.error(`Error connecting to Database: ${error.message}`);
    isConnecting = null; // Reset promise so we can retry on next request
    throw error;
  }
};

module.exports = connectDB;
