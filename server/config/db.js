import mongoose from "mongoose";
import dns from "dns";

// Use public DNS servers to resolve MongoDB Atlas SRV records on Windows/local DNS environments
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  // Fallback if DNS override is restricted
}

let mongoServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      `MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    console.warn("MongoDB Atlas connection failed, attempting in-memory fallback:", error.message);
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`InMemory MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    } catch (memErr) {
      console.error("InMemory MongoDB fallback failed:", memErr.message);
      if (!process.env.VERCEL) {
        process.exit(1);
      }
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("MongoDB disconnect failed:", error.message);
  }
};

export { connectDB, disconnectDB };