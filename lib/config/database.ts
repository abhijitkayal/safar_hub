import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in environment variables");
}

let connectionPromise: Promise<void | mongoose.Connection> | null = null;
let isInitialized = false;

export default async function dbConnect() {
  // Already connected
  if (mongoose.connection.readyState === 1) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // Connection in progress started elsewhere
  if (mongoose.connection.readyState === 2 && connectionPromise === null) {
    connectionPromise = mongoose.connection.asPromise().finally(() => {
      connectionPromise = null;
    });
  }

  if (connectionPromise) {
    await connectionPromise;
    return;
  }

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable command buffering
    })
    .then(async () => {
      console.log("✅ MongoDB connected successfully");
      console.log(`📊 Database: ${mongoose.connection.db?.databaseName}`);
      
      // Initialize collections on first connection
      if (!isInitialized) {
        const { initializeCollections } = await import("@/lib/db/initCollections");
        await initializeCollections();
        isInitialized = true;
      }
    })
    .catch((error) => {
      console.error("❌ MongoDB connection error:", error);
      throw new Error("Failed to connect to MongoDB");
    })
    .finally(() => {
      connectionPromise = null;
    });

  await connectionPromise;
}