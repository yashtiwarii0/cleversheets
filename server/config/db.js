import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // Use in-memory MongoDB server for development
      console.log('Starting MongoDB Memory Server for development');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      console.log(`MongoDB Memory Server URI: ${mongoUri}`);
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
      return conn;
    } else {
      // Use actual MongoDB URI for production
      console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

export default connectDB;