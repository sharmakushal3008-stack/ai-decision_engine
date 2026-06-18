const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI environment variable is missing. In-memory database is not supported in production serverless environments.');
      }
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log('Spun up purely in-memory MongoDB Server since no MONGO_URI was provided.');
    }

    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to Database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
